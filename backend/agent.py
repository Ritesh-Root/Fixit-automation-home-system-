"""FixIt Agent — Claude API orchestrator with tool use.

Adapted from HaalChal's agent.py. Uses Claude's tool-use API in an agentic loop
where the model autonomously decides which tools to call based on conversation context.
"""

import json
import time
from anthropic import Anthropic
from tools import TOOL_DEFINITIONS, execute_tool

client = Anthropic()

SYSTEM_PROMPT = """You are FixIt, an AI service booking agent. You handle home service requests end-to-end through natural conversation.

PERSONALITY:
- Efficient, friendly, proactive — like a concierge who anticipates needs
- Confident but not pushy — always confirm before taking action
- Concise — respect the user's time

RULES:
1. ALWAYS call classify_issue on the user's first message describing a problem.
2. ALWAYS present exactly 3 vendor options with ratings, prices, and availability.
3. NEVER book without explicit user confirmation ("Book X" or "Yes, go ahead").
4. NEVER process payment without explicit user confirmation.
5. After booking, proactively offer to set reminders and explain next steps.
6. Only present information returned by tools. NEVER fabricate vendor names, prices, or ratings.
7. If the user's request is unclear, ask ONE clarifying question, not multiple.
8. Keep responses concise — 2-3 sentences max unless presenting vendor options.
9. When a user asks about an existing booking, use get_booking_status.
10. After service completion, ask for a review.

FORMATTING:
- Use markdown for vendor comparisons (numbered list with bold names)
- Star ratings as "4.8/5"
- Prices as ranges "$80-$120"
- Confirmation codes in bold: **FX-1234**
- Status updates with timeline format

IMPORTANT CONTEXT:
- When you call search_vendors, the vendor results include a vendor_id field. Use this exact vendor_id when calling check_availability or create_booking.
- When you call create_booking, the result includes a booking_id. Use this for process_payment, get_booking_status, and submit_review.
- The user_id is provided in the conversation context. Always pass it to create_booking.
- For dates, use YYYY-MM-DD format. Today's date will be provided in the context if needed.
- Present at most 3 vendors to keep the conversation focused.
"""


async def chat_with_agent(
    user_message: str,
    conversation_history: list[dict],
    user_id: str = "anonymous",
) -> dict:
    """Send a message to the FixIt agent and get a response with tool use."""

    # Add context about user and date
    context_prompt = SYSTEM_PROMPT + f"\n\nCurrent user_id: {user_id}"

    # Build messages list
    messages = conversation_history + [{"role": "user", "content": user_message}]

    # Initial API call
    response = client.messages.create(
        model="claude-sonnet-4-6-20250514",
        max_tokens=1024,
        system=context_prompt,
        tools=TOOL_DEFINITIONS,
        messages=messages,
    )

    # Process tool use in a loop — track all tool calls for transparency panel
    all_tool_calls = []
    booking_data = None
    payment_data = None
    vendor_data = None
    review_data = None

    while response.stop_reason == "tool_use":
        # Collect all tool uses from the response
        tool_use_blocks = [b for b in response.content if b.type == "tool_use"]
        tool_result_contents = []

        for tool_use in tool_use_blocks:
            start_time = time.time()
            result = execute_tool(tool_use.name, tool_use.input)
            elapsed_ms = round((time.time() - start_time) * 1000)

            # Track tool call for transparency panel
            all_tool_calls.append({
                "tool_name": tool_use.name,
                "input_summary": _summarize_tool_input(tool_use.name, tool_use.input),
                "result_summary": _summarize_tool_result(tool_use.name, result),
                "duration_ms": elapsed_ms,
            })

            # Track specific tool results for frontend rendering
            if tool_use.name == "search_vendors" and result.get("vendors"):
                vendor_data = result["vendors"]
            elif tool_use.name == "create_booking" and result.get("booking_id"):
                booking_data = result
            elif tool_use.name == "process_payment" and result.get("payment_id"):
                payment_data = result
            elif tool_use.name == "get_booking_status" and result.get("booking_id"):
                booking_data = result
            elif tool_use.name == "submit_review" and result.get("success"):
                review_data = result

            tool_result_contents.append({
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": json.dumps(result),
            })

        # Continue the conversation with tool results
        messages = messages + [
            {"role": "assistant", "content": response.content},
            {"role": "user", "content": tool_result_contents},
        ]

        response = client.messages.create(
            model="claude-sonnet-4-6-20250514",
            max_tokens=1024,
            system=context_prompt,
            tools=TOOL_DEFINITIONS,
            messages=messages,
        )

    # Extract final text response
    text_response = ""
    for block in response.content:
        if hasattr(block, "text"):
            text_response += block.text

    # Build the full message history for the frontend to store
    final_history = conversation_history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": text_response},
    ]

    return {
        "response": text_response,
        "booking": booking_data,
        "payment": payment_data,
        "vendor_list": vendor_data,
        "review": review_data,
        "tool_calls": all_tool_calls,
        "history": final_history,
    }


def _summarize_tool_input(tool_name: str, tool_input: dict) -> str:
    """Create a short human-readable summary of tool input."""
    if tool_name == "classify_issue":
        msg = tool_input.get("message", "")
        return f'Analyzing: "{msg[:60]}..."' if len(msg) > 60 else f'Analyzing: "{msg}"'
    elif tool_name == "search_vendors":
        return f"Category: {tool_input.get('category', 'unknown')}"
    elif tool_name == "check_availability":
        return f"Date: {tool_input.get('date', 'unknown')}"
    elif tool_name == "create_booking":
        return f"Slot: {tool_input.get('time_slot', 'unknown')} on {tool_input.get('date', 'unknown')}"
    elif tool_name == "process_payment":
        return f"${tool_input.get('amount', 0):.2f} {tool_input.get('payment_type', 'payment')}"
    elif tool_name == "get_booking_status":
        return f"Booking: {tool_input.get('booking_id', 'unknown')}"
    elif tool_name == "submit_review":
        return f"{tool_input.get('rating', '?')}/5 stars"
    return str(tool_input)[:80]


def _summarize_tool_result(tool_name: str, result: dict) -> str:
    """Create a short human-readable summary of tool result."""
    if result.get("error"):
        return f"Error: {result['error']}"
    if tool_name == "classify_issue":
        cat = result.get("category_name", result.get("category", "unknown"))
        return f"{cat}, {result.get('urgency', 'unknown')} urgency"
    elif tool_name == "search_vendors":
        count = result.get("count", 0)
        return f"{count} vendors found"
    elif tool_name == "check_availability":
        slots = result.get("available_slots", [])
        return f"{len(slots)} slots available"
    elif tool_name == "create_booking":
        return f"Booked: {result.get('confirmation_code', 'N/A')}"
    elif tool_name == "process_payment":
        return f"{result.get('status', 'unknown')}"
    elif tool_name == "get_booking_status":
        return f"Status: {result.get('status', 'unknown')}"
    elif tool_name == "submit_review":
        return "Review submitted"
    return "OK"
