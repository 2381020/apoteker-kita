import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import type { ChatIntent, ChatMessage, ChatSource } from "@/lib/chatbot";

type Row = Database["public"]["Tables"]["chat_messages"]["Row"];
type Insert = Database["public"]["Tables"]["chat_messages"]["Insert"];

const toMessage = (row: Row): ChatMessage => ({
  id: row.id,
  text: row.content,
  isUser: row.role === "user",
  createdAt: row.created_at,
  intent: (row.intent ?? undefined) as ChatIntent | undefined,
  source: (row.source ?? undefined) as ChatSource | undefined,
});

export async function listChatMessages(
  userId: string,
  limit = 100
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).reverse().map(toMessage);
}

export async function appendChatMessage(
  userId: string,
  message: ChatMessage
): Promise<ChatMessage> {
  const insert: Insert = {
    user_id: userId,
    role: message.isUser ? "user" : "assistant",
    content: message.text.slice(0, 4000),
    intent: message.intent ?? null,
    source: message.source ?? null,
  };

  const { data, error } = await supabase
    .from("chat_messages")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;

  return toMessage(data);
}

export async function clearChatMessages(userId: string): Promise<void> {
  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
