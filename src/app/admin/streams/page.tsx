"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAllStreams } from "@/hooks/useStream";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Trash2, Plus, Minus, Search } from "lucide-react";
import { tmdb } from "@/api/tmdb";
import { Image } from "@heroui/react";

type Server = { label: string; m3u8_url: string };
type EpisodeRow = { episode: number; servers: Server[] };
type MediaPreview = { title: string; overview: string; poster: string; year: string };

const defaultServer = (): Server => ({ label: "", m3u8_url: "" });

// =====================
// PREVIEW HOOK
// =====================
function useMediaPreview(type: "movie" | "tv") {
  const [preview, setPreview] = useState<MediaPreview | null>(null);
  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPreview(mediaId: string) {
    const id = parseInt(mediaId);
    if (!id) { setError("ID không hợp lệ."); return; }
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      if (type === "movie") {
        const data = await tmdb.movies.details(id);
        const p = {
          title: data.title,
          overview: data.overview,
          poster: data.poster_path ? `https://image.tmdb.org/t/p/w200${data.poster_path}` : "",
          year: data.release_date?.slice(0, 4) ?? "",
        };
        setPreview(p);
        setTitle(data.title);
        setOverview(data.overview);
      } else {
        const data = await tmdb.tvShows.details(id);
        const p = {
          title: data.name,
          overview: data.overview,
          poster: data.poster_path ? `https://image.tmdb.org/t/p/w200${data.poster_path}` : "",
          year: data.first_air_date?.slice(0, 4) ?? "",
        };
        setPreview(p);
        setTitle(data.name);
        setOverview(data.overview);
      }
    } catch {
      setError("Không tìm thấy. Kiểm tra lại ID và loại.");
    }
    setLoading(false);
  }

  function reset() { setPreview(null); setTitle(""); setOverview(""); setError(null); }

  return { preview, title, setTitle, overview, setOverview, loading, error, fetchPreview, reset };
}

// =====================
// PREVIEW CARD + EDIT
// =====================
function MediaEditSection({
  preview, title, setTitle, overview, setOverview
}: {
  preview: MediaPreview;
  title: string;
  setTitle: (v: string) => void;
  overview: string;
  setOverview: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-success/40 bg-success/10 p-3 mt-2 flex flex-col gap-3">
      <div className="flex gap-3">
        {preview.poster && (
          <Image src={preview.poster} alt={title} width={60} className="rounded-lg shrink-0 object-cover" />
        )}
        <div className="flex flex-col gap-1 text-xs text-default-400">
          <p>Năm: {preview.year}</p>
          <p className="italic">Có thể chỉnh sửa tên và mô tả bên dưới thành tiếng Việt.</p>
        </div>
      </div>
      <Input
        label="Tên phim"
        size="sm"
        value={title}
        onValueChange={setTitle}
        placeholder="Nhập tên tiếng Việt..."
      />
      <Textarea
        label="Mô tả"
        size="sm"
        value={overview}
        onValueChange={setOverview}
        placeholder="Nhập mô tả tiếng Việt..."
        minRows={3}
      />
    </div>
  );
}

// =====================
// UPDATE METADATA
// =====================
function UpdateMetadataForm() {
  const supabase = createClient();
  const [mediaId, setMediaId] = useState("");
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { preview, title, setTitle, overview, setOverview, loading, error: previewError, fetchPreview, reset } = useMediaPreview(type);

  function handleMediaIdChange(v: string) { setMediaId(v); reset(); }
  function handleTypeChange(keys: any) { setType(Array.from(keys)[0] as "movie" | "tv"); reset(); }

  async function handleSave() {
    if (!mediaId || !title) { setError("Cần có ID và tên phim."); return; }
    setSaving(true);
    setError(null);
      const { error: upsertError } = await (supabase as any).from("media_metadata").upsert({
      media_id: parseInt(mediaId),
      type,
      title: title.trim(),
      overview: overview.trim(),
    }, { onConflict: "media_id,type" });
    setSaving(false);
    if (upsertError) { setError(upsertError.message); }
    else {
      setSuccess(true);
      setMediaId(""); reset();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="rounded-2xl border border-divider bg-content1 p-6 mb-6">
      <h2 className="text-base font-semibold mb-1">✏️ Cập nhật tên & mô tả tiếng Việt</h2>
      <p className="text-xs text-default-500 mb-4">Dùng cho các phim đã nhập trước đó chưa có tên tiếng Việt.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input label="TMDB ID" placeholder="Ví dụ: 129" value={mediaId}
              onValueChange={handleMediaIdChange} description="Nhập ID phim cần cập nhật" />
            <Button isIconOnly className="self-center mt-3" variant="flat" color="default"
  isLoading={loading} onPress={() => fetchPreview(mediaId)} title="Tải từ TMDB">
              <Search size={16} />
            </Button>
          </div>
          {previewError && <p className="text-xs text-danger">{previewError}</p>}
        </div>
        <Select label="Loại" selectedKeys={[type]} onSelectionChange={handleTypeChange}>
          <SelectItem key="movie">Movie</SelectItem>
          <SelectItem key="tv">TV Series</SelectItem>
        </Select>
      </div>

      {preview && (
        <MediaEditSection
          preview={preview} title={title} setTitle={setTitle}
          overview={overview} setOverview={setOverview}
        />
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {success && <p className="mt-3 text-sm text-success">✓ Đã cập nhật!</p>}

      {preview && (
        <Button color="warning" className="mt-4" onPress={handleSave} isLoading={saving}>
          Lưu metadata
        </Button>
      )}
    </div>
  );
}

// =====================
// BULK ADD (TV Series)
// =====================
function BulkTvForm({ onSaved }: { onSaved: () => void }) {
  const supabase = createClient();
  const [mediaId, setMediaId] = useState("");
  const [season, setSeason] = useState("1");
  const [episodeCount, setEpisodeCount] = useState("");
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([]);
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { preview, title, setTitle, overview, setOverview, loading, error: previewError, fetchPreview, reset } = useMediaPreview("tv");

  function handleMediaIdChange(v: string) { setMediaId(v); reset(); }

  function generate() {
    const count = parseInt(episodeCount);
    if (!count || count < 1) { setError("Nhập số tập hợp lệ."); return; }
    setError(null);
    setEpisodes(Array.from({ length: count }, (_, i) => ({ episode: i + 1, servers: [defaultServer()] })));
    setGenerated(true);
  }

  function addServer(epIdx: number) {
    setEpisodes((prev) => prev.map((ep, i) => i === epIdx ? { ...ep, servers: [...ep.servers, defaultServer()] } : ep));
  }

  function removeServer(epIdx: number, srvIdx: number) {
    setEpisodes((prev) => prev.map((ep, i) => i === epIdx ? { ...ep, servers: ep.servers.filter((_, j) => j !== srvIdx) } : ep));
  }

  function updateServer(epIdx: number, srvIdx: number, field: keyof Server, value: string) {
    setEpisodes((prev) => prev.map((ep, i) =>
      i === epIdx ? { ...ep, servers: ep.servers.map((s, j) => j === srvIdx ? { ...s, [field]: value } : s) } : ep
    ));
  }

  function copyLabelsFromEp1() {
    if (episodes.length === 0) return;
    const labels = episodes[0].servers.map((s) => s.label);
    setEpisodes((prev) => prev.map((ep, i) => {
      if (i === 0) return ep;
      return { ...ep, servers: labels.map((label, j) => ({ label, m3u8_url: ep.servers[j]?.m3u8_url ?? "" })) };
    }));
  }

  async function handleSave() {
    if (!mediaId) { setError("Nhập TMDB ID."); return; }
    const rows = episodes.flatMap((ep) =>
      ep.servers.filter((s) => s.m3u8_url.trim()).map((s) => ({
        media_id: parseInt(mediaId),
        type: "tv" as const,
        season: parseInt(season),
        episode: ep.episode,
        label: s.label.trim() || null,
        m3u8_url: s.m3u8_url.trim(),
      }))
    );
    if (rows.length === 0) { setError("Chưa có link nào được nhập."); return; }
    setSaving(true);
    setError(null);

    // Lưu metadata tiếng Việt
    if (title) {
      await (supabase as any).from("media_metadata").upsert({
        media_id: parseInt(mediaId),
        type: "tv",
        title: title.trim(),
        overview: overview.trim(),
      }, { onConflict: "media_id,type" });
    }

    const { error: insertError } = await supabase.from("streams").insert(rows);
    setSaving(false);
    if (insertError) { setError(insertError.message); }
    else {
      setSuccess(true);
      setGenerated(false); setEpisodes([]);
      setMediaId(""); setSeason("1"); setEpisodeCount("");
      reset();
      onSaved();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="rounded-2xl border border-divider bg-content1 p-6 mb-6">
      <h2 className="text-base font-semibold mb-1">📺 Thêm hàng loạt — TV Series</h2>
      <p className="text-xs text-default-500 mb-4">Nhập số tập để tạo bảng, sau đó điền link cho từng tập và từng server.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-2">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input label="TMDB ID" placeholder="Ví dụ: 1396" value={mediaId}
              onValueChange={handleMediaIdChange} description="Lấy từ themoviedb.org/tv/..." />
            <Button isIconOnly className="self-center mt-3" variant="flat" color="secondary"
              isLoading={loading} onPress={() => fetchPreview(mediaId)} title="Xem trước">
              <Search size={16} />
            </Button>
          </div>
          {previewError && <p className="text-xs text-danger">{previewError}</p>}
        </div>
        <Input label="Season" type="number" value={season} onValueChange={setSeason} />
        <Input label="Số tập" type="number" placeholder="Ví dụ: 10" value={episodeCount} onValueChange={setEpisodeCount} />
      </div>

      {preview && (
        <MediaEditSection
          preview={preview} title={title} setTitle={setTitle}
          overview={overview} setOverview={setOverview}
        />
      )}

      <Button color="secondary" variant="flat" onPress={generate} className="mb-4 mt-4">
        Tạo bảng nhập liệu
      </Button>

      {generated && episodes.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-default-500">{episodes.length} tập</p>
            <Button size="sm" variant="flat" onPress={copyLabelsFromEp1}>
              Copy tên server từ Tập 1 xuống tất cả
            </Button>
          </div>

          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {episodes.map((ep, epIdx) => (
              <div key={ep.episode} className="rounded-xl border border-divider p-4">
                <p className="text-sm font-semibold mb-3 text-primary">Tập {ep.episode}</p>
                <div className="flex flex-col gap-2">
                  {ep.servers.map((srv, srvIdx) => (
                    <div key={srvIdx} className="flex gap-2 items-center">
                      <Input size="sm" placeholder="Tên server (Vietsub, Lồng tiếng...)" value={srv.label}
                        onValueChange={(v) => updateServer(epIdx, srvIdx, "label", v)} className="w-48 shrink-0" />
                      <Input size="sm" placeholder="https://... .m3u8" value={srv.m3u8_url}
                        onValueChange={(v) => updateServer(epIdx, srvIdx, "m3u8_url", v)} className="flex-1" />
                      <Button isIconOnly size="sm" variant="light" color="danger"
                        onPress={() => removeServer(epIdx, srvIdx)} isDisabled={ep.servers.length === 1}>
                        <Minus size={14} />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" variant="flat" color="primary" startContent={<Plus size={14} />}
                    onPress={() => addServer(epIdx)} className="self-start mt-1">
                    Thêm server
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          {success && <p className="mt-3 text-sm text-success">✓ Đã lưu tất cả!</p>}

          <Button color="primary" className="mt-4" onPress={handleSave} isLoading={saving}>
            Lưu tất cả ({episodes.filter((ep) => ep.servers.some((s) => s.m3u8_url)).length} tập)
          </Button>
        </>
      )}
    </div>
  );
}

// =====================
// SINGLE ADD
// =====================
function SingleForm({ onSaved }: { onSaved: () => void }) {
  const supabase = createClient();
  const [mediaId, setMediaId] = useState("");
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [season, setSeason] = useState("0");
  const [episode, setEpisode] = useState("0");
  const [servers, setServers] = useState<Server[]>([defaultServer()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { preview, title, setTitle, overview, setOverview, loading, error: previewError, fetchPreview, reset } = useMediaPreview(type);

  const isTV = type === "tv";

  function handleMediaIdChange(v: string) { setMediaId(v); reset(); }
  function handleTypeChange(keys: any) { setType(Array.from(keys)[0] as "movie" | "tv"); reset(); }

  function addServer() { setServers((s) => [...s, defaultServer()]); }
  function removeServer(i: number) { setServers((s) => s.filter((_, j) => j !== i)); }
  function updateServer(i: number, field: keyof Server, value: string) {
    setServers((s) => s.map((srv, j) => j === i ? { ...srv, [field]: value } : srv));
  }

  async function handleSave() {
    if (!mediaId) { setError("Nhập TMDB ID."); return; }
    const rows = servers.filter((s) => s.m3u8_url.trim()).map((s) => ({
      media_id: parseInt(mediaId),
      type,
      season: isTV ? parseInt(season) : 0,
      episode: isTV ? parseInt(episode) : 0,
      label: s.label.trim() || null,
      m3u8_url: s.m3u8_url.trim(),
    }));
    if (rows.length === 0) { setError("Nhập ít nhất 1 link."); return; }
    setSaving(true);
    setError(null);

    // Lưu metadata tiếng Việt
    if (title) {
      await (supabase as any).from("media_metadata").upsert({
        media_id: parseInt(mediaId),
        type,
        title: title.trim(),
        overview: overview.trim(),
      }, { onConflict: "media_id,type" });
    }

    const { error: insertError } = await supabase.from("streams").insert(rows);
    setSaving(false);
    if (insertError) { setError(insertError.message); }
    else {
      setSuccess(true);
      setServers([defaultServer()]); setMediaId(""); setSeason("0"); setEpisode("0");
      reset();
      onSaved();
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div className="rounded-2xl border border-divider bg-content1 p-6 mb-8">
      <h2 className="text-base font-semibold mb-1">🎬 Thêm 1 phim / 1 tập lẻ</h2>
      <p className="text-xs text-default-500 mb-4">Dùng để thêm movie hoặc 1 tập TV bất kỳ với nhiều server.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input label="TMDB ID" placeholder="Ví dụ: 550" value={mediaId}
              onValueChange={handleMediaIdChange} description="Lấy từ themoviedb.org" />
            <Button isIconOnly className="self-center mt-3" variant="flat" color="secondary"
              isLoading={loading} onPress={() => fetchPreview(mediaId)} title="Xem trước">
              <Search size={16} />
            </Button>
          </div>
          {previewError && <p className="text-xs text-danger">{previewError}</p>}
        </div>
        <Select label="Loại" selectedKeys={[type]} onSelectionChange={handleTypeChange}>
          <SelectItem key="movie">Movie</SelectItem>
          <SelectItem key="tv">TV Series</SelectItem>
        </Select>
        {isTV && (
          <>
            <Input label="Season" type="number" value={season} onValueChange={setSeason} />
            <Input label="Episode" type="number" value={episode} onValueChange={setEpisode} />
          </>
        )}
      </div>

      {preview && (
        <MediaEditSection
          preview={preview} title={title} setTitle={setTitle}
          overview={overview} setOverview={setOverview}
        />
      )}

      <p className="text-sm font-medium mb-2 mt-4">Danh sách server:</p>
      <div className="flex flex-col gap-2 mb-3">
        {servers.map((srv, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input size="sm" placeholder="Tên server (Vietsub, Lồng tiếng...)" value={srv.label}
              onValueChange={(v) => updateServer(i, "label", v)} className="w-48 shrink-0" />
            <Input size="sm" placeholder="https://... .m3u8" value={srv.m3u8_url}
              onValueChange={(v) => updateServer(i, "m3u8_url", v)} className="flex-1" />
            <Button isIconOnly size="sm" variant="light" color="danger"
              onPress={() => removeServer(i)} isDisabled={servers.length === 1}>
              <Minus size={14} />
            </Button>
          </div>
        ))}
      </div>

      <Button size="sm" variant="flat" color="primary" startContent={<Plus size={14} />} onPress={addServer} className="mb-4">
        Thêm server
      </Button>

      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      {success && <p className="mb-2 text-sm text-success">✓ Đã lưu!</p>}

      <div className="flex gap-2">
        <Button color="primary" onPress={handleSave} isLoading={saving}>Lưu</Button>
        <Button variant="flat" onPress={() => { setServers([defaultServer()]); setMediaId(""); reset(); }}>Reset</Button>
      </div>
    </div>
  );
}

// =====================
// MAIN PAGE
// =====================
export default function AdminStreamsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: streams, isLoading } = useAllStreams();

  function invalidate() { queryClient.invalidateQueries({ queryKey: ["streams-all"] }); }

  async function handleDelete(id: number) {
    await supabase.from("streams").delete().eq("id", id);
    invalidate();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Quản lý Stream</h1>
      <p className="mb-8 text-sm text-default-500">Thêm link m3u8 cho phim và TV show. Mỗi tập có thể có nhiều server.</p>

      <UpdateMetadataForm />
      <BulkTvForm onSaved={invalidate} />
      <SingleForm onSaved={invalidate} />

      <h2 className="mb-3 text-base font-semibold">Danh sách đã nhập ({streams?.length ?? 0} server)</h2>
      <Table aria-label="Danh sách streams" removeWrapper>
        <TableHeader>
          <TableColumn>TMDB ID</TableColumn>
          <TableColumn>Loại</TableColumn>
          <TableColumn>Season / Ep</TableColumn>
          <TableColumn>Tên Server</TableColumn>
          <TableColumn>URL</TableColumn>
          <TableColumn> </TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent="Chưa có stream nào." items={streams ?? []}>
          {(stream) => (
            <TableRow key={stream.id}>
              <TableCell>{stream.media_id}</TableCell>
              <TableCell>
                <Chip size="sm" color={stream.type === "movie" ? "primary" : "secondary"} variant="flat">
                  {stream.type}
                </Chip>
              </TableCell>
              <TableCell>{stream.type === "tv" ? `S${stream.season} E${stream.episode}` : "—"}</TableCell>
              <TableCell><span className="font-medium">{stream.label ?? "—"}</span></TableCell>
              <TableCell>
                <span className="max-w-[200px] truncate text-sm text-default-500 block">{stream.m3u8_url}</span>
              </TableCell>
              <TableCell>
                <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleDelete(stream.id)}>
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