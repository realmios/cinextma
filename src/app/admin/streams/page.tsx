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
import { Trash2, Plus } from "lucide-react";
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
    if (!form.label.trim()) {
      setError("Tên server không được để trống (ví dụ: Vietsub, Thuyết minh).");
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
      label: form.label.trim(),
    };

    // INSERT thay vì upsert — cho phép nhiều server
    const { error: insertError } = await supabase
      .from("streams")
      .insert(payload);

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      // Giữ lại media_id, type, season, episode để thêm server tiếp cho cùng tập
      setForm((f) => ({ ...f, m3u8_url: "", label: "" }));
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
        Mỗi phim/tập có thể có nhiều server. Thêm từng server một với tên riêng.
      </p>

      {/* Form thêm stream */}
      <div className="mb-8 rounded-2xl border border-divider bg-content1 p-6">
        <h2 className="mb-4 text-base font-semibold">Thêm Server</h2>

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
            label="Tên Server"
            placeholder="Vietsub, Thuyết minh, 1080p, Server 2..."
            value={form.label}
            onValueChange={(v) => setForm((f) => ({ ...f, label: v }))}
            description="Tên hiển thị cho người xem khi chọn server"
          />

          <Input
            label="M3U8 URL"
            placeholder="https://example.com/video.m3u8"
            value={form.m3u8_url}
            onValueChange={(v) => setForm((f) => ({ ...f, m3u8_url: v }))}
          />
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        {success && (
          <p className="mt-3 text-sm text-success">
            ✓ Đã thêm server! Bạn có thể tiếp tục thêm server khác cho cùng phim/tập.
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={handleSubmit}
            isLoading={saving}
          >
            Thêm Server
          </Button>
          <Button
            variant="flat"
            onPress={() => setForm(defaultForm)}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Danh sách streams — group theo media_id */}
      <h2 className="mb-3 text-base font-semibold">
        Danh sách đã nhập ({streams?.length ?? 0} server)
      </h2>

      <Table aria-label="Danh sách streams" removeWrapper>
        <TableHeader>
          <TableColumn>TMDB ID</TableColumn>
          <TableColumn>Loại</TableColumn>
          <TableColumn>Season / Ep</TableColumn>
          <TableColumn>Tên Server</TableColumn>
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
              <TableCell>
                <span className="font-medium">{stream.label ?? "—"}</span>
              </TableCell>
              <TableCell>
                <span className="max-w-[200px] truncate text-sm text-default-500 block">
                  {stream.m3u8_url}
                </span>
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