export type ApiResponse<T> = {
  status: "success" | "fail";
  data: T | null;
  pagination: {
    page: number;
    page_size: number;
    total: number;
  } | null;
  error_msg: string | null;
};

export type Rumor = {
  id: number;
  slug: string;
  title_th: string;
  summary_th: string;
  status: string;
  confidence_score: number;
  heat_score: number;
  source_name: string;
  source_type: string;
  original_url: string;
  disclaimer: string;
};

export type Article = {
  id: number;
  slug: string;
  title_th: string;
  summary_th: string;
  category: string;
  source_credit_text: string;
  source_name: string;
  source_type: string;
  original_url: string;
  published_at: string;
};
