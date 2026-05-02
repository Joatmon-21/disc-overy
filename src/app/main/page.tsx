"use client";

import { Button } from "@/components/ui/button";
import {
  Search,
  Disc,
  House,
  ArrowLeft,
  Trash2,
  Edit2,
  Check,
  Plus,
  Music2,
  LogOut,
  Pause,
  Play,
  Send,
  MessageSquare,
  Volume2,
  VolumeX,
  Heart,
  Users,
  X,
  Menu,
  ListMusic,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";

// Define the shape of our data
interface Song {
  id: string;
  artist: string;
  name: string;
  file_path: string;
  cover_path: string | null;
}

interface Comment {
  id: number;
  content: string;
  user_id: string;
  song_id: number;
  created_at: string;
  is_edited: boolean;
  users: {
    username: string;
  };
}

interface Playlist {
  id: number;
  name: string;
  user_id: string;
}

interface SoulmateMatch {
  username: string;
  matchPercent: number;
  commonSongs: string[];
}

export default function Page() {
  const router = useRouter();

  // 1. STATE MANAGEMENT
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<number | null>(null);
  const [editPlaylistValue, setEditPlaylistValue] = useState("");
  const [addToPlaylistSongId, setAddToPlaylistSongId] = useState<string | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentValue, setEditCommentValue] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Mini-player controls
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"songs" | "playlists" | "soulmate">("songs");

  // Soulmate
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [showSoulmate, setShowSoulmate] = useState(false);
  const [soulmateResults, setSoulmateResults] = useState<SoulmateMatch[]>([]);
  const [soulmateLoading, setSoulmateLoading] = useState(false);

  // 2. DATA FETCHING FUNCTIONS (Defined before effects to avoid hoisting issues)[cite: 3]
  
  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from("music_vault")
      .select("*")
      .order("name", { ascending: true });
    if (!error && data) setSongs(data);
  };

  const fetchUserData = async (username: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", username)
      .single();
    console.log("[fetchUserData] username:", username, "| data:", data, "| error:", error);
    if (data) {
      setUserId(data.user_id);
      fetchPlaylists(data.user_id);
      fetchDiscoverable(data.user_id);
    } else console.warn("[fetchUserData] userId not set — user not found in DB or column mismatch");
  };

  const fetchComments = async (songId: string) => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        users!comments_user_id_fkey ( username )
      `)
      .eq("song_id", songId)
      .order("created_at", { ascending: true });
    console.log("[fetchComments] songId:", songId, "| data:", data, "| error:", error);
    if (!error && data) setComments(data as any);
  };

  const fetchPlaylists = async (uid: string) => {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", uid)
      .order("id", { ascending: true });
    if (!error && data) setPlaylists(data);
  };

  const fetchDiscoverable = async (uid: string) => {
    const { data } = await supabase
      .from("users")
      .select("is_discoverable")
      .eq("user_id", uid)
      .single();
    if (data) setIsDiscoverable(data.is_discoverable ?? false);
  };

  const toggleDiscoverable = async () => {
    if (!userId) return;
    const next = !isDiscoverable;
    const { error, data } = await supabase
      .from("users")
      .update({ is_discoverable: next })
      .eq("user_id", userId)
      .select();
    if (!error) setIsDiscoverable(next);
    else console.error("toggleDiscoverable error:", error);
    console.log("[toggleDiscoverable] userId:", userId, "next:", next, "data:", data, "error:", error);
  };

  const findSoulmates = async () => {
    if (!userId) return;
    if (!isDiscoverable) {
      setShowSoulmate(true);
      setSoulmateResults([]);
      return;
    }
    setSoulmateLoading(true);
    setShowSoulmate(true);

    // 1. Get current user's playlist songs
    const { data: myPlaylists } = await supabase
      .from("playlists")
      .select("id")
      .eq("user_id", userId);

    const myPlaylistIds = (myPlaylists || []).map((p: any) => p.id);
    let mySongIds: string[] = [];

    if (myPlaylistIds.length > 0) {
      const { data: mySongs } = await supabase
        .from("playlist_songs")
        .select("song_id")
        .in("playlist_id", myPlaylistIds);
      mySongIds = [...new Set((mySongs || []).map((s: any) => String(s.song_id)))];
    }

    // 2. Get all discoverable users except self
    const { data: discoverableUsers } = await supabase
      .from("users")
      .select("user_id, username")
      .eq("is_discoverable", true)
      .neq("user_id", userId);

    if (!discoverableUsers || discoverableUsers.length === 0) {
      setSoulmateResults([]);
      setSoulmateLoading(false);
      return;
    }

    // 3. For each discoverable user, get their playlist songs and compute match
    const results: SoulmateMatch[] = [];

    for (const other of discoverableUsers) {
      const { data: theirPlaylists } = await supabase
        .from("playlists")
        .select("id")
        .eq("user_id", other.user_id);

      const theirPlaylistIds = (theirPlaylists || []).map((p: any) => p.id);
      let theirSongIds: string[] = [];

      if (theirPlaylistIds.length > 0) {
        const { data: theirSongs } = await supabase
          .from("playlist_songs")
          .select("song_id")
          .in("playlist_id", theirPlaylistIds);
        theirSongIds = [...new Set((theirSongs || []).map((s: any) => String(s.song_id)))];
      }

      if (theirSongIds.length === 0 || mySongIds.length === 0) continue;

      const commonIds = mySongIds.filter(id => theirSongIds.includes(id));
      const union = [...new Set([...mySongIds, ...theirSongIds])];
      const matchPercent = union.length === 0 ? 0 : Math.round((commonIds.length / union.length) * 100);

      // Fetch song names for common songs
      let commonSongs: string[] = [];
      if (commonIds.length > 0) {
        const { data: commonSongData } = await supabase
          .from("music_vault")
          .select("name")
          .in("id", commonIds)
          .limit(3);
        commonSongs = (commonSongData || []).map((s: any) => s.name);
      }

      results.push({ username: other.username, matchPercent, commonSongs });
    }

    // Sort by best match
    results.sort((a, b) => b.matchPercent - a.matchPercent);
    setSoulmateResults(results);
    setSoulmateLoading(false);
  };

  const fetchPlaylistSongs = async (playlistId: number) => {
    const { data, error } = await supabase
      .from("playlist_songs")
      .select("song_id, music_vault(*)")
      .eq("playlist_id", playlistId);
    if (!error && data) {
      const songs = data.map((row: any) => row.music_vault).filter(Boolean);
      setPlaylistSongs(songs);
    }
  };

  const handleOpenPlaylist = (pl: Playlist) => {
    setActivePlaylist(pl);
    fetchPlaylistSongs(pl.id);
  };

  const handleClosePlaylist = () => {
    setActivePlaylist(null);
    setPlaylistSongs([]);
  };

  const handleRemoveFromPlaylist = async (songId: string) => {
    if (!activePlaylist) return;
    const { error } = await supabase
      .from("playlist_songs")
      .delete()
      .eq("playlist_id", activePlaylist.id)
      .eq("song_id", songId);
    if (!error) fetchPlaylistSongs(activePlaylist.id);
  };

  // 3. AUTH & INITIALIZATION
  useEffect(() => {
    const savedUser = document.cookie
      .split("; ")
      .find((row) => row.startsWith("discovery_user="))
      ?.split("=")[1];
    if (!savedUser) {
      router.replace("/");
    } else {
      setUser(savedUser);
      setIsAuthorized(true);
      fetchUserData(savedUser);
      fetchSongs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Fetch comments whenever the active song changes
  useEffect(() => {
    if (currentSong) {
      fetchComments(currentSong.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  // 4. ACTION HANDLERS
  const handleLogout = () => {
    document.cookie = "discovery_user=; path=/; max-age=0";
    window.location.href = "/";
  };

  const handlePostComment = async () => {
    console.log("[handlePostComment] newComment:", newComment, "| currentSong:", currentSong, "| userId:", userId);
    if (!newComment.trim() || !currentSong || !userId) {
      console.warn("[handlePostComment] Blocked — missing:", { hasComment: !!newComment.trim(), hasSong: !!currentSong, hasUserId: !!userId });
      return;
    }
    const { data, error } = await supabase.from("comments").insert([
      { content: newComment, user_id: userId, song_id: currentSong.id }
    ]).select();
    console.log("[handlePostComment] insert result — data:", data, "| error:", error);
    if (!error) {
      setNewComment("");
      fetchComments(currentSong.id);
    }
  };

  const handleDeleteComment = async (id: number) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) fetchComments(currentSong!.id);
  };

  const handleUpdateComment = async (id: number) => {
    // Sets is_edited to true so it reflects in the UI[cite: 4]
    const { error } = await supabase
      .from("comments")
      .update({ content: editCommentValue, is_edited: true })
      .eq("id", id);
    
    if (!error) {
      setEditingCommentId(null);
      fetchComments(currentSong!.id);
    }
  };

  const loadSong = useCallback((song: Song) => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(0);
    const newAudio = new Audio(song.file_path);
    newAudio.volume = volume;
    newAudio.ontimeupdate = () => { if (!isSeeking) setCurrentTime(newAudio.currentTime); };
    newAudio.ondurationchange = () => setDuration(newAudio.duration);
    newAudio.onended = () => setIsPlaying(false);
    audioRef.current = newAudio;
    return newAudio;
  }, [volume, isSeeking]);

  const togglePlay = (song: Song, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      const newAudio = loadSong(song);
      newAudio.play().catch((err) => console.error("Playback failed:", err));
      setIsPlaying(true);
    }
  };

  // Load song into player without playing (for comments view)
  const handleCardClick = (song: Song) => {
    if (currentSong?.id !== song.id) loadSong(song);
    setShowFullPlayer(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSeekCommit = () => {
    if (audioRef.current) audioRef.current.currentTime = currentTime;
    setIsSeeking(false);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !userId) return;
    const { error } = await supabase
      .from("playlists")
      .insert([{ name: newPlaylistName, user_id: userId }]);
    if (!error) {
      setNewPlaylistName("");
      fetchPlaylists(userId);
    }
  };

  const savePlaylistEdit = async (id: number) => {
    const { error } = await supabase
      .from("playlists")
      .update({ name: editPlaylistValue })
      .eq("id", id);
    if (!error) {
      setEditingPlaylistId(null);
      fetchPlaylists(userId!);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    // Delete child rows first to satisfy foreign key constraint
    const { error: songsError } = await supabase.from("playlist_songs").delete().eq("playlist_id", id);
    if (songsError) { console.error("Error deleting playlist songs:", songsError); return; }
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (!error) {
      fetchPlaylists(userId!);
      if (activePlaylist?.id === id) handleClosePlaylist();
    } else {
      console.error("Error deleting playlist:", error);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!addToPlaylistSongId) return;
    // Avoid duplicates
    const { data: existing } = await supabase
      .from("playlist_songs")
      .select("id")
      .eq("playlist_id", playlistId)
      .eq("song_id", addToPlaylistSongId)
      .single();
    if (existing) { setAddToPlaylistSongId(null); return; }
    const { error } = await supabase
      .from("playlist_songs")
      .insert([{ playlist_id: playlistId, song_id: addToPlaylistSongId }]);
    if (!error) setAddToPlaylistSongId(null);
  };

  // 5. SECURITY GUARD: Prevents UI flicker while checking auth
  if (!isAuthorized) {
    return <div className="min-h-screen bg-black" />;
  }

  const displayedSongs = searchQuery.trim()
    ? songs.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : songs;

  // ── Reusable panel components ──────────────────────────────

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden selection:bg-primary/30">
      <main className={`${showFullPlayer ? "opacity-0 pointer-events-none" : "opacity-100"} transition-opacity duration-300`}>

        {/* ── DESKTOP NAV ─────────────────────────────────────── */}
        <nav className="hidden md:flex items-center justify-between h-24 gap-2 px-10 border-b border-border">
          <div className="flex shrink-0 items-center gap-2 text-xl font-bold">
            <Disc className="w-10 h-10 text-primary animate-spin-slow" />
            <span className="italic uppercase tracking-tighter">Disc-Overy</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleClosePlaylist} className="rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800"><House className="w-4 h-4" /></Button>
            <div className="relative w-full max-w-md group flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleClosePlaylist(); }}
                placeholder="Search the vault..."
                className="w-96 bg-card/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-widest text-zinc-500">{user}</span>
            <button onClick={handleLogout} className="flex items-center justify-center w-10 h-10 bg-primary rounded-full text-black hover:scale-105 active:scale-95 transition-transform">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* ── MOBILE NAV ──────────────────────────────────────── */}
        <nav className="md:hidden flex items-center justify-between h-16 px-4 border-b border-border sticky top-0 bg-black/90 backdrop-blur-md z-40">
          <div className="flex items-center gap-2 text-base font-bold">
            <Disc className="w-7 h-7 text-primary animate-spin-slow" />
            <span className="italic uppercase tracking-tighter">Disc-Overy</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-widest text-zinc-500">{user}</span>
            <button onClick={handleLogout} className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-black">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>

        {/* ── MOBILE SEARCH BAR ───────────────────────────────── */}
        <div className="md:hidden px-4 py-3 border-b border-white/5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleClosePlaylist(); setMobileTab("songs"); }}
              placeholder="Search the vault..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        </div>

        {/* ── MOBILE TAB BAR ──────────────────────────────────── */}
        <div className="md:hidden flex border-b border-white/5 sticky top-16 bg-black/90 backdrop-blur-md z-30">
          {([
            { id: "songs", label: "Songs", icon: <Music2 size={16} /> },
            { id: "playlists", label: "Playlists", icon: <ListMusic size={16} /> },
            { id: "soulmate", label: "Soulmate", icon: <Heart size={16} /> },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-black uppercase tracking-widest transition-colors border-b-2 ${mobileTab === tab.id ? 'text-primary border-primary' : 'text-zinc-600 border-transparent'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── DESKTOP LAYOUT ──────────────────────────────────── */}
        <div className="hidden md:grid py-5 grid-cols-12 w-full">
          <div className="col-span-2 flex flex-col items-center py-5 px-3 gap-6">
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 text-center">Pulse Visibility</p>
        <button
          onClick={toggleDiscoverable}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isDiscoverable ? 'bg-primary' : 'bg-zinc-700'}`}
        >
          <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${isDiscoverable ? 'translate-x-8' : 'translate-x-0'}`} />
        </button>
        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDiscoverable ? 'text-primary' : 'text-zinc-600'}`}>
          {isDiscoverable ? 'Visible' : 'Hidden'}
        </p>
        <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
          {isDiscoverable ? 'Others can find you as a soulmate' : 'You are hidden from soulmate search'}
        </p>
      </div>
      <button
        onClick={findSoulmates}
        className="w-full flex flex-col items-center gap-3 p-5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group"
      >
        <Heart size={26} className="text-primary group-hover:scale-110 transition-transform" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary text-center leading-relaxed">Find Music<br/>Soulmate</p>
      </button>
    </div>
          </div>
          
          <div className="col-span-8 py-5 px-10 border-x border-white/5 min-h-screen">
      <>
        {activePlaylist ? (
          <>
            <button onClick={handleClosePlaylist} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">All Songs</span>
            </button>
            <p className="font-sans text-primary tracking-tighter uppercase text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">Collection</p>
            <p className="font-sans font-black tracking-tighter uppercase text-5xl md:text-9xl leading-none mb-6 md:mb-0">
              {activePlaylist.name.toUpperCase()}
            </p>
            {playlistSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Music2 className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No Songs in Playlist</p>
                <p className="text-zinc-700 text-[10px]">Add songs from the main vault</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 w-full py-8 md:py-15 gap-4 md:gap-8">
                {playlistSongs.map((song) => (
              <div key={song.id} onClick={() => handleCardClick(song)} className="group relative w-full rounded-xl bg-zinc-900/40 p-3 md:p-4 transition-all duration-300 hover:bg-zinc-800/60 border border-white/5 cursor-pointer">
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg bg-zinc-800">
                  {song.cover_path ? (
                    <img src={song.cover_path} alt={song.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Music2 className="absolute inset-0 m-auto w-8 h-8 md:w-12 md:h-12 text-zinc-700 group-hover:text-primary transition-colors" />
                  )}
                  <div
                    onClick={(e) => togglePlay(song, e)}
                    className={`absolute bottom-2 right-2 flex h-10 w-10 md:h-12 md:w-12 cursor-pointer items-center justify-center rounded-full bg-primary shadow-xl transition-all duration-300 ${currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'} hover:scale-105 active:scale-95 text-black`}
                  >
                    {currentSong?.id === song.id && isPlaying ? <Pause className="fill-black w-4 h-4 md:w-5 md:h-5" /> : <Play className="fill-black w-4 h-4 md:w-5 md:h-5 ml-0.5" />}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="truncate font-bold text-white tracking-tight text-sm">{song.name}</h3>
                  <p className="text-xs text-zinc-400 tracking-tighter font-medium truncate">{song.artist}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromPlaylist(song.id); }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={9} /> Remove
                  </button>
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="font-sans text-primary tracking-tighter uppercase text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">Daily Discovery</p>
            <p className="font-sans font-black tracking-tighter uppercase text-5xl md:text-9xl leading-none">YOUR PULSE.</p>
            {displayedSongs.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Search className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No results for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 w-full py-8 md:py-15 gap-4 md:gap-8 content-start">
                {displayedSongs.map((song) => (
              <div key={song.id} onClick={() => handleCardClick(song)} className="group relative w-full rounded-xl bg-zinc-900/40 p-3 md:p-4 transition-all duration-300 hover:bg-zinc-800/60 border border-white/5 cursor-pointer">
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg bg-zinc-800">
                  {song.cover_path ? (
                    <img src={song.cover_path} alt={song.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Music2 className="absolute inset-0 m-auto w-8 h-8 md:w-12 md:h-12 text-zinc-700 group-hover:text-primary transition-colors" />
                  )}
                  <div
                    onClick={(e) => togglePlay(song, e)}
                    className={`absolute bottom-2 right-2 flex h-10 w-10 md:h-12 md:w-12 cursor-pointer items-center justify-center rounded-full bg-primary shadow-xl transition-all duration-300 ${currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'} hover:scale-105 active:scale-95 text-black`}
                  >
                    {currentSong?.id === song.id && isPlaying ? <Pause className="fill-black w-4 h-4 md:w-5 md:h-5" /> : <Play className="fill-black w-4 h-4 md:w-5 md:h-5 ml-0.5" />}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="truncate font-bold text-white tracking-tight text-sm">{song.name}</h3>
                  <p className="text-xs text-zinc-400 tracking-tighter font-medium truncate">{song.artist}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAddToPlaylistSongId(addToPlaylistSongId === song.id ? null : song.id); }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Plus size={9} /> Add to Playlist
                  </button>
                  {addToPlaylistSongId === song.id && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-white/10 rounded-xl p-2 z-10 shadow-xl">
                      {playlists.length === 0 ? (
                        <p className="text-[9px] text-zinc-500 text-center py-1">No playlists yet</p>
                      ) : (
                        playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(pl.id); }}
                            className="w-full text-left text-[10px] px-2 py-1.5 rounded hover:bg-white/5 text-zinc-300 hover:text-white transition-colors truncate"
                          >
                            {pl.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        )}
      </>
          </div>
          <div className="col-span-2 py-8 px-6 sticky top-0 h-screen flex flex-col">
    <div className="flex flex-col gap-4 w-full h-full">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 text-center">My Collections</h3>
      <div className="relative">
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
          placeholder="New Playlist..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-3 pr-10 text-sm focus:border-primary outline-none transition-all"
        />
        <button onClick={handleCreatePlaylist} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
          <Plus size={18} />
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {playlists.length === 0 && (
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center mt-4">No collections yet.</p>
        )}
        {playlists.map((pl) => (
          <div key={pl.id} className="group flex flex-col gap-1 p-3.5 rounded-xl bg-white/[0.03] border border-transparent hover:border-white/10 hover:bg-white/[0.05] transition-all">
            {editingPlaylistId === pl.id ? (
              <div className="flex items-center gap-2">
                <input autoFocus className="bg-black border border-primary/50 rounded px-2 py-1 text-[11px] w-full outline-none" value={editPlaylistValue} onChange={(e) => setEditPlaylistValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && savePlaylistEdit(pl.id)} />
                <button onClick={() => savePlaylistEdit(pl.id)} className="text-primary"><Check size={14}/></button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 truncate cursor-pointer" onClick={() => { handleOpenPlaylist(pl); setMobileTab("songs"); }}>
                  <Music2 size={14} className={`shrink-0 transition-colors ${activePlaylist?.id === pl.id ? 'text-primary' : 'text-zinc-500'}`} />
                  <span className={`text-sm font-semibold truncate transition-colors ${activePlaylist?.id === pl.id ? 'text-primary' : ''}`}>{pl.name}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingPlaylistId(pl.id); setEditPlaylistValue(pl.name); }} className="text-zinc-500 hover:text-white"><Edit2 size={12}/></button>
                  <button onClick={() => handleDeletePlaylist(pl.id)} className="text-zinc-500 hover:text-red-500"><Trash2 size={12}/></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
          </div>
        </div>

        {/* ── MOBILE CONTENT ──────────────────────────────────── */}
        <div className="md:hidden pb-40">
          {mobileTab === "songs" && (
            <div className="px-4 pt-4">
      <>
        {activePlaylist ? (
          <>
            <button onClick={handleClosePlaylist} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">All Songs</span>
            </button>
            <p className="font-sans text-primary tracking-tighter uppercase text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">Collection</p>
            <p className="font-sans font-black tracking-tighter uppercase text-5xl md:text-9xl leading-none mb-6 md:mb-0">
              {activePlaylist.name.toUpperCase()}
            </p>
            {playlistSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Music2 className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No Songs in Playlist</p>
                <p className="text-zinc-700 text-[10px]">Add songs from the main vault</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 w-full py-8 md:py-15 gap-4 md:gap-8">
                {playlistSongs.map((song) => (
              <div key={song.id} onClick={() => handleCardClick(song)} className="group relative w-full rounded-xl bg-zinc-900/40 p-3 md:p-4 transition-all duration-300 hover:bg-zinc-800/60 border border-white/5 cursor-pointer">
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg bg-zinc-800">
                  {song.cover_path ? (
                    <img src={song.cover_path} alt={song.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Music2 className="absolute inset-0 m-auto w-8 h-8 md:w-12 md:h-12 text-zinc-700 group-hover:text-primary transition-colors" />
                  )}
                  <div
                    onClick={(e) => togglePlay(song, e)}
                    className={`absolute bottom-2 right-2 flex h-10 w-10 md:h-12 md:w-12 cursor-pointer items-center justify-center rounded-full bg-primary shadow-xl transition-all duration-300 ${currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'} hover:scale-105 active:scale-95 text-black`}
                  >
                    {currentSong?.id === song.id && isPlaying ? <Pause className="fill-black w-4 h-4 md:w-5 md:h-5" /> : <Play className="fill-black w-4 h-4 md:w-5 md:h-5 ml-0.5" />}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="truncate font-bold text-white tracking-tight text-sm">{song.name}</h3>
                  <p className="text-xs text-zinc-400 tracking-tighter font-medium truncate">{song.artist}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFromPlaylist(song.id); }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={9} /> Remove
                  </button>
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="font-sans text-primary tracking-tighter uppercase text-xl md:text-2xl drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">Daily Discovery</p>
            <p className="font-sans font-black tracking-tighter uppercase text-5xl md:text-9xl leading-none">YOUR PULSE.</p>
            {displayedSongs.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Search className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No results for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 w-full py-8 md:py-15 gap-4 md:gap-8 content-start">
                {displayedSongs.map((song) => (
              <div key={song.id} onClick={() => handleCardClick(song)} className="group relative w-full rounded-xl bg-zinc-900/40 p-3 md:p-4 transition-all duration-300 hover:bg-zinc-800/60 border border-white/5 cursor-pointer">
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg bg-zinc-800">
                  {song.cover_path ? (
                    <img src={song.cover_path} alt={song.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Music2 className="absolute inset-0 m-auto w-8 h-8 md:w-12 md:h-12 text-zinc-700 group-hover:text-primary transition-colors" />
                  )}
                  <div
                    onClick={(e) => togglePlay(song, e)}
                    className={`absolute bottom-2 right-2 flex h-10 w-10 md:h-12 md:w-12 cursor-pointer items-center justify-center rounded-full bg-primary shadow-xl transition-all duration-300 ${currentSong?.id === song.id ? 'opacity-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'} hover:scale-105 active:scale-95 text-black`}
                  >
                    {currentSong?.id === song.id && isPlaying ? <Pause className="fill-black w-4 h-4 md:w-5 md:h-5" /> : <Play className="fill-black w-4 h-4 md:w-5 md:h-5 ml-0.5" />}
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="truncate font-bold text-white tracking-tight text-sm">{song.name}</h3>
                  <p className="text-xs text-zinc-400 tracking-tighter font-medium truncate">{song.artist}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setAddToPlaylistSongId(addToPlaylistSongId === song.id ? null : song.id); }}
                    className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <Plus size={9} /> Add to Playlist
                  </button>
                  {addToPlaylistSongId === song.id && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-white/10 rounded-xl p-2 z-10 shadow-xl">
                      {playlists.length === 0 ? (
                        <p className="text-[9px] text-zinc-500 text-center py-1">No playlists yet</p>
                      ) : (
                        playlists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={(e) => { e.stopPropagation(); handleAddToPlaylist(pl.id); }}
                            className="w-full text-left text-[10px] px-2 py-1.5 rounded hover:bg-white/5 text-zinc-300 hover:text-white transition-colors truncate"
                          >
                            {pl.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
                ))}
              </div>
            )}
          </>
        )}
      </>
            </div>
          )}
          {mobileTab === "playlists" && (
            <div className="px-4 pt-4 min-h-screen">
    <div className="flex flex-col gap-4 w-full h-full">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 text-center">My Collections</h3>
      <div className="relative">
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
          placeholder="New Playlist..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-3 pr-10 text-sm focus:border-primary outline-none transition-all"
        />
        <button onClick={handleCreatePlaylist} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
          <Plus size={18} />
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {playlists.length === 0 && (
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest text-center mt-4">No collections yet.</p>
        )}
        {playlists.map((pl) => (
          <div key={pl.id} className="group flex flex-col gap-1 p-3.5 rounded-xl bg-white/[0.03] border border-transparent hover:border-white/10 hover:bg-white/[0.05] transition-all">
            {editingPlaylistId === pl.id ? (
              <div className="flex items-center gap-2">
                <input autoFocus className="bg-black border border-primary/50 rounded px-2 py-1 text-[11px] w-full outline-none" value={editPlaylistValue} onChange={(e) => setEditPlaylistValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && savePlaylistEdit(pl.id)} />
                <button onClick={() => savePlaylistEdit(pl.id)} className="text-primary"><Check size={14}/></button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 truncate cursor-pointer" onClick={() => { handleOpenPlaylist(pl); setMobileTab("songs"); }}>
                  <Music2 size={14} className={`shrink-0 transition-colors ${activePlaylist?.id === pl.id ? 'text-primary' : 'text-zinc-500'}`} />
                  <span className={`text-sm font-semibold truncate transition-colors ${activePlaylist?.id === pl.id ? 'text-primary' : ''}`}>{pl.name}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingPlaylistId(pl.id); setEditPlaylistValue(pl.name); }} className="text-zinc-500 hover:text-white"><Edit2 size={12}/></button>
                  <button onClick={() => handleDeletePlaylist(pl.id)} className="text-zinc-500 hover:text-red-500"><Trash2 size={12}/></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
            </div>
          )}
          {mobileTab === "soulmate" && (
            <div className="px-4 pt-4">
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 text-center">Pulse Visibility</p>
        <button
          onClick={toggleDiscoverable}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isDiscoverable ? 'bg-primary' : 'bg-zinc-700'}`}
        >
          <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${isDiscoverable ? 'translate-x-8' : 'translate-x-0'}`} />
        </button>
        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDiscoverable ? 'text-primary' : 'text-zinc-600'}`}>
          {isDiscoverable ? 'Visible' : 'Hidden'}
        </p>
        <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
          {isDiscoverable ? 'Others can find you as a soulmate' : 'You are hidden from soulmate search'}
        </p>
      </div>
      <button
        onClick={findSoulmates}
        className="w-full flex flex-col items-center gap-3 p-5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group"
      >
        <Heart size={26} className="text-primary group-hover:scale-110 transition-transform" />
        <p className="text-[10px] font-black uppercase tracking-widest text-primary text-center leading-relaxed">Find Music<br/>Soulmate</p>
      </button>
    </div>
            </div>
          )}
        </div>
      </main>
      
      {/* SOULMATE OVERLAY */}
      {showSoulmate && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Heart size={18} className="text-primary" />
                <p className="text-sm font-black uppercase tracking-widest">Music Soulmates</p>
              </div>
              <button onClick={() => setShowSoulmate(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
              {soulmateLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Heart size={32} className="text-primary animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Scanning the vault...</p>
                </div>
              ) : soulmateResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Users size={32} className="text-zinc-700" />
                  {!isDiscoverable ? (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Pulse Visibility is off</p>
                      <p className="text-[9px] text-zinc-600 text-center">Turn on Pulse Visibility to find your music soulmate!</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">No discoverable users found</p>
                      <p className="text-[9px] text-zinc-600 text-center">Ask your friends to turn on Pulse Visibility!</p>
                    </>
                  )}
                </div>
              ) : (
                soulmateResults.map((match, i) => (
                  <div key={match.username} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                    {/* Rank */}
                    <span className="text-[9px] font-black text-zinc-600 w-4 shrink-0">#{i + 1}</span>
                    {/* Avatar placeholder */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-primary">{match.username[0]}</span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black tracking-wider truncate">{match.username}</p>
                      {match.commonSongs.length > 0 && (
                        <p className="text-[8px] text-zinc-500 truncate mt-0.5">
                          {match.commonSongs.join(" · ")}
                        </p>
                      )}
                    </div>
                    {/* Match % */}
                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className="text-sm font-black text-primary">{match.matchPercent}%</span>
                      <div className="w-16 h-1 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${match.matchPercent}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer note */}
            <div className="px-6 py-4 border-t border-white/5">
              <p className="text-[8px] text-zinc-600 text-center uppercase tracking-widest">Match is based on overlapping playlist songs using Jaccard similarity</p>
            </div>
          </div>
        </div>
      )}

      {/* FULL PLAYER OVERLAY */}
      <div className={`fixed inset-0 z-[65] bg-black transition-transform duration-500 ease-in-out ${showFullPlayer ? "translate-y-0" : "translate-y-full"}`}>
        <div className="h-full w-full flex flex-col px-6 md:px-16 pt-6 md:pt-10" style={{paddingBottom: "calc(96px + 1.5rem)"}}>
          <button onClick={() => setShowFullPlayer(false)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-3 md:mb-8 shrink-0">
            <ArrowLeft className="w-6 h-6" />
            <span className="uppercase font-bold tracking-widest text-sm">Return</span>
          </button>
          
          <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-10 min-h-0 overflow-y-auto">
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center shrink-0">
              <div className="aspect-square bg-zinc-900 rounded-3xl shadow-2xl flex items-center justify-center border border-white/10 mb-3 md:mb-6 overflow-hidden relative" style={{width: "min(56vw, 440px)", flexShrink: 0}}>
                {currentSong?.cover_path ? (
                  <img src={currentSong.cover_path} alt={currentSong.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Disc className={`w-40 h-40 text-primary/20 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                )}
                <button onClick={() => currentSong && togglePlay(currentSong)} className="absolute inset-0 m-auto w-14 h-14 md:w-20 md:h-20 bg-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform">
                   {isPlaying ? <Pause className="fill-black w-8 h-8" /> : <Play className="fill-black w-8 h-8 ml-2" />}
                </button>
              </div>
              <h2 className="text-xl md:text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-center leading-tight">{currentSong?.name || "No Track Selected"}</h2>
              <p className="text-sm md:text-xl lg:text-2xl text-primary font-bold uppercase tracking-widest opacity-80 text-center">{currentSong?.artist || "Unknown Artist"}</p>
            </div>            

            {/* COMMENT SECTION PANEL */}
            <div className="w-full md:w-1/2 bg-zinc-900/30 rounded-3xl border border-white/5 backdrop-blur-sm flex flex-col overflow-hidden flex-1 md:flex-none" style={{minHeight: "300px"}}>
                <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em]">Pulse Insights</p>
                  <MessageSquare size={16} className="text-primary" />
                </div>

                <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-3 no-scrollbar min-h-0">
                  {comments.map((comment) => (
                    <div key={comment.id} className="animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-primary">{comment.users?.username}</span>
                          <span className="text-[9px] text-zinc-600">{new Date(comment.created_at).toLocaleDateString()}</span>
                          {comment.is_edited && <span className="text-[8px] text-zinc-500 italic">Edited</span>}
                        </div>
                        {comment.user_id === userId && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingCommentId(comment.id); setEditCommentValue(comment.content); }}
                              className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                              title="Edit comment"
                            >
                              <Edit2 size={12}/>
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-zinc-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
                              title="Delete comment"
                            >
                              <Trash2 size={12}/>
                            </button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="flex gap-2 bg-white/5 p-2 rounded-xl border border-primary/20">
                          <input autoFocus className="bg-transparent border-none text-sm w-full outline-none text-white" value={editCommentValue} onChange={(e) => setEditCommentValue(e.target.value)} />
                          <button onClick={() => handleUpdateComment(comment.id)} className="text-primary hover:scale-110 transition-transform"><Check size={16}/></button>
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-300 bg-white/5 p-4 rounded-2xl rounded-tl-none leading-relaxed border border-white/5">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-zinc-600 text-xs uppercase tracking-widest mt-20">No pulse inights shared yet.</p>
                  )}
                </div>

                <div className="p-3 md:p-6 border-t border-white/5 flex gap-3 shrink-0">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                    placeholder="Share your pulse..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:border-primary outline-none transition-all"
                  />
                  <button onClick={handlePostComment} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform active:scale-95">
                    <Send size={18} />
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* MINI PLAYER (BOTTOM BAR) */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 px-4 md:px-8 z-[60] flex flex-col">
        {/* Seek bar — full width at top */}
        <div className="flex items-center gap-3 pt-3 pb-1">
          <span className="text-[10px] text-zinc-500 w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <input
            type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={() => setIsSeeking(true)}
            onMouseUp={handleSeekCommit}
            onTouchStart={() => setIsSeeking(true)}
            onTouchEnd={handleSeekCommit}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 h-1 accent-primary cursor-pointer"
            style={{ background: duration ? `linear-gradient(to right, var(--primary) ${(currentTime/duration)*100}%, #3f3f46 ${(currentTime/duration)*100}%)` : '#3f3f46' }}
          />
          <span className="text-[10px] text-zinc-500 w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
        {/* Main row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Song info — clickable to open full player */}
          <div onClick={() => setShowFullPlayer(true)} className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 group">
            <div className="h-10 w-10 rounded-md bg-zinc-900 flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
              {currentSong?.cover_path
                ? <img src={currentSong.cover_path} alt={currentSong.name} className="w-full h-full object-cover" />
                : <Music2 className={`w-5 h-5 ${isPlaying ? 'text-primary' : 'text-zinc-600'}`} />}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{currentSong?.name || "Select a track"}</p>
              <p className="text-xs text-zinc-400 truncate">{currentSong?.artist || ""}</p>
            </div>
          </div>
          {/* Play/pause */}
          <button onClick={(e) => { e.stopPropagation(); currentSong && togglePlay(currentSong); }} className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-transform shrink-0">
            {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
          </button>
          {/* Volume — hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleToggleMute} className="text-zinc-500 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-primary cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--primary) ${(isMuted ? 0 : volume)*100}%, #3f3f46 ${(isMuted ? 0 : volume)*100}%)` }}
            />
          </div>
          <div onClick={() => setShowFullPlayer(true)} className="hidden md:block text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors cursor-pointer shrink-0">Expand</div>
        </div>
      </div>
    </div>
  );
}