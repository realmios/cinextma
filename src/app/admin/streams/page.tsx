"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAllStreams } from "@/hooks/useStream";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Trash2, Plus, ExternalLink } from "lucide-react";
import clsx from "clsx";

type FormState = {
  media_id: string;
  type: "movie" | "tv";
  season: string;
  episode: string;
  m3u8_url: string;
  label: string;
};

const defaultForm: FormState = {
  media_id: "",
  type: "movie",
  season: "0",
  episode: "0",
  m3u8_url: "",
  label: "",
};

export default function AdminStreamsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: streams, isLoading } = useAllStreams();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isTV = form.type === "tv";

  async function handleSubmit() {
    if (!form.media_id || !form.m3u8_url) {
      setError("TMDB ID và M3U8 URL không được để trống.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      media_id: parseInt(form.media_id),
      type: form.type,
      season: isTV ? parseInt(form.season) : 0,
      episode: isTV ? parseInt(form.episode) : 0,
      m3u8_url: form.m3u8_url.trim(),
      label: form.label.trim() || null,
    };

    const { error: upsertError } = await supabase
      .from("streams")
      .upsert(payload, { onConflict: "media_id,type,season,episode" });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSuccess(true);
      setForm(defaultForm);
      queryClient.invalidateQueries({ queryKey: ["streams-all"] });
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  async function handleDelete(id: number) {
    await supabase.from("streams").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["streams-all"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Quản lý Stream</h1>
      <p className="mb-8 text-sm text-default-500">
        Nhập TMDB ID và link M3U8 để app dùng stream của bạn thay vì nguồn mặc định.
      </p>

      {/* Form thêm stream */}
      <div className="mb-8 rounded-2xl border border-divider bg-content1 p-6">
        <h2 className="mb-4 text-base font-semibold">Thêm / Cập nhật Stream</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="TMDB ID"
            placeholder="Ví dụ: 550"
            type="number"
            value={form.media_id}
            onValueChange={(v) => setForm((f) => ({ ...f, media_id: v }))}
            description="Lấy từ URL trên themoviedb.org"
          />

          <Select
            label="Loại"
            selectedKeys={[form.type]}
            onSelectionChange={(keys) =>
              setForm((f) => ({ ...f, type: Array.from(keys)[0] as "movie" | "tv" }))
            }
          >
            <SelectItem key="movie">Movie</SelectItem>
            <SelectItem key="tv">TV Series</SelectItem>
          </Select>

          {isTV && (
            <>
              <Input
                label="Season"
                type="number"
                value={form.season}
                onValueChange={(v) => setForm((f) => ({ ...f, season: v }))}
              />
              <Input
                label="Episode"
                type="number"
                value={form.episode}
                onValueChange={(v) => setForm((f) => ({ ...f, episode: v }))}
              />
            </>
          )}

          <Input
            label="M3U8 URL"
            placeholder="https://example.com/video.m3u8"
            value={form.m3u8_url}
            onValueChange={(v) => setForm((f) => ({ ...f, m3u8_url: v }))}
            className={clsx({ "sm:col-span-2": !isTV })}
          />

          <Input
            label="Label (tuỳ chọn)"
            placeholder="Vietsub, Thuyết minh, 1080p..."
            value={form.label}
            onValueChange={(v) => setForm((f) => ({ ...f, label: v }))}
          />
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        {success && <p className="mt-3 text-sm text-success">✓ Đã lưu thành công!</p>}

        <Button
          color="primary"
          className="mt-4"
          startContent={<Plus size={16} />}
          onPress={handleSubmit}
          isLoading={saving}
        >
          Lưu Stream
        </Button>
      </div>

      {/* Danh sách streams */}
      <h2 className="mb-3 text-base font-semibold">Danh sách đã nhập ({streams?.length ?? 0})</h2>

      <Table aria-label="Danh sách streams" removeWrapper>
        <TableHeader>
          <TableColumn>TMDB ID</TableColumn>
          <TableColumn>Loại</TableColumn>
          <TableColumn>Season / Ep</TableColumn>
          <TableColumn>Label</TableColumn>
          <TableColumn>URL</TableColumn>
          <TableColumn> </TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isLoading}
          emptyContent="Chưa có stream nào."
          items={streams ?? []}
        >
          {(stream) => (
            <TableRow key={stream.id}>
              <TableCell>{stream.media_id}</TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={stream.type === "movie" ? "primary" : "secondary"}
                  variant="flat"
                >
                  {stream.type}
                </Chip>
              </TableCell>
              <TableCell>
                {stream.type === "tv" ? `S${stream.season} E${stream.episode}` : "—"}
              </TableCell>
              <TableCell>{stream.label ?? "—"}</TableCell>
              <TableCell>
                <a
                  href={stream.m3u8_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <span className="max-w-[180px] truncate">{stream.m3u8_url}</span>
                  <ExternalLink size={12} />
                </a>
              </TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => handleDelete(stream.id)}
                  aria-label="Xoá"
                >
                  <Trash2 size={15} />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
