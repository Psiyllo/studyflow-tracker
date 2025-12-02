import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCourseNotes(courseId: string) {
  const [notes, setNotes] = useState([]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("course_notes")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error loading notes:", error);
      setNotes([]);
    }
  };

  const addNote = async (title: string, description: string) => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("course_notes").insert({
      user_id: user.id,
      course_id: courseId,
      title,
      description,
    });

    if (!error) loadNotes();
  };

  const updateNote = async (id: string, title: string, description: string) => {
    const { error } = await supabase
      .from("course_notes")
      .update({
        title,
        description,
        updated_at: new Date(),
      })
      .eq("id", id);

    if (!error) loadNotes();
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from("course_notes")
      .delete()
      .eq("id", id);

    if (!error) loadNotes();
  };

  useEffect(() => {
    loadNotes();
  }, [courseId]);

  return { notes, addNote, updateNote, deleteNote };
}
