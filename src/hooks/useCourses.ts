import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface CourseNote {
  id: string;
  course_id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  platform: string | null;
  url: string | null;
  status: "active" | "paused" | "completed";
  type: "course" | "lesson";
  created_at: string;
  notes?: CourseNote[];
}

export const useCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    if (!user) {
      setCourses([]);
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      const { data: notesData } = await supabase
        .from("course_notes")
        .select("*")
        .eq("user_id", user.id);

      const formatted = (coursesData || []).map((course: any) => ({
        ...course,
        notes: (notesData || []).filter((n: any) => n.course_id === course.id),
        type: course.type || 'course',
      }));

      const coursesOnly = formatted.filter(c => c.type === 'course');
      const lessonsOnly = formatted.filter(c => c.type === 'lesson');

      setCourses(coursesOnly);
      setLessons(lessonsOnly);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const createCourse = async (
    courseData: Omit<Course, "id" | "user_id" | "created_at" | "notes">
  ) => {
    if (!user) return { error: new Error("User not authenticated") };

    try {
      const { data, error } = await supabase
        .from("courses")
        .insert({
          user_id: user.id,
          ...courseData,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCourses();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchCourses();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) throw error;

      await fetchCourses();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    courses,
    lessons,
    loading,
    createCourse,
    updateCourse,
    deleteCourse,
    refetch: fetchCourses,
  };
};