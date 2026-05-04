import { createInsForgeServerClient } from "@/lib/insforge-server";

export type ReaderFollow = {
  id: string;
  target_type: "professional" | "topic" | "section";
  target_slug: string;
  target_name: string;
  created_at: string;
};

export type ReaderBookmark = {
  id: string;
  item_type: "project" | "article" | "news";
  item_slug: string;
  title: string;
  image_url: string | null;
  created_at: string;
};

export type NewsletterSubscription = {
  id: string;
  email: string;
  subscriber_name?: string | null;
  status: "subscribed" | "unsubscribed";
  updated_at: string;
};

export type ReaderFolder = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ReaderFolderItem = {
  id: string;
  folder_id: string;
  item_type: "project" | "article" | "news";
  item_slug: string;
  title: string;
  image_url: string | null;
  created_at: string;
};

export async function getReaderHub(accessToken: string) {
  const client = createInsForgeServerClient(accessToken);

  const [{ data: follows }, { data: bookmarks }, { data: newsletter }, { data: folders }, { data: folderItems }] =
    await Promise.all([
    client.database
      .from("reader_follows")
      .select("id, target_type, target_slug, target_name, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    client.database
      .from("reader_bookmarks")
      .select("id, item_type, item_slug, title, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    client.database
      .from("newsletter_subscriptions")
      .select("id, email, subscriber_name, status, updated_at")
      .limit(1),
    client.database
      .from("reader_folders")
      .select("id, name, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100),
    client.database
      .from("reader_folder_items")
      .select("id, folder_id, item_type, item_slug, title, image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(400),
  ]);

  const followsList = (Array.isArray(follows) ? follows : []) as ReaderFollow[];
  const bookmarksList = (Array.isArray(bookmarks) ? bookmarks : []) as ReaderBookmark[];
  const newsletterRow = ((Array.isArray(newsletter) ? newsletter[0] : newsletter) ??
    null) as NewsletterSubscription | null;
  const foldersList = (Array.isArray(folders) ? folders : []) as ReaderFolder[];
  const folderItemsList = (Array.isArray(folderItems) ? folderItems : []) as ReaderFolderItem[];

  return {
    follows: followsList,
    bookmarks: bookmarksList,
    folders: foldersList,
    folderItems: folderItemsList,
    newsletter: newsletterRow,
    counts: {
      follows: followsList.length,
      bookmarks: bookmarksList.length,
      folders: foldersList.length,
    },
  };
}
