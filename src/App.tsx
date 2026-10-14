import { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion, MotionConfig } from 'motion/react';

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Bookmark,
  Disc3,
  Heart,
  AudioLines,
  Music2,
  PanelLeftClose,
  ListMusic,
  Monitor,
  Pause,
  Play,
  Plus,
  Repeat,
  Search,
  Settings2,
  Shuffle,
  SkipBack,
  SkipForward,
  Smartphone,
  Sun,
  Moon,
  UserRound,
  Volume2,
  X,
} from 'lucide-react';

import {
  albums,
  tracks,
  playlists,
  getAlbum,
  getTrack,
  time,
  type Album,
  type Track,
} from './lib/catalog';

import { readLibrary, toggle, stepIndex, moveQueue } from './lib/model';

import { useDemoAudio } from './hooks/use-demo-audio';

import {
  AnimatedTabs,
  AlbumRail,
  MotionDialog,
  PageTransition,
  SpringDock,
  MotionPreferences,
} from './components/motion-ui';

import { Button } from './components/ui/button';
import {
  GlassRadioGroup,
  SkyToggle,
  ThemePreviews,
  ElasticGallery,
  VinylReveal,
  ScrambleNote,
  ProfileCard,
  PlaylistOrder,
  type ThemeMode,
} from './components/ui/selected-motion';

type PlayOptions = { toggle?: boolean; source?: string };

type Route = {
  type:
    | 'home'
    | 'browse'
    | 'search'
    | 'collection'
    | 'album'
    | 'artist'
    | 'playlist';
  id?: string;
};

const storageKey = 'serein-demo-library-v1';

const parseRoute = (): Route => {
  const [type, id] = location.hash.slice(1).split('/');
  return [
    'home',
    'browse',
    'search',
    'collection',
    'album',
    'artist',
    'playlist',
  ].includes(type)
    ? { type: type as Route['type'], id }
    : { type: 'home' };
};

export function Cover({
  album,
  className = '',
}: {
  album: Album;
  className?: string;
}) {
  return (
    <div
      className={`cover cover-${album.art} ${className}`}
      style={{ '--art-color': album.color } as React.CSSProperties}
      aria-label={`обложка ${album.title}`}
    >
      <span className="cover-art" aria-hidden="true" />
      <img
        className="cover-photo"
        src={album.image}
        alt=""
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <strong>{album.title}</strong>
      <small>
        {album.artist}
        <br />
        s—{String(albums.indexOf(album) + 1).padStart(3, '0')}
      </small>
    </div>
  );
}

export function App() {
  const forcedPhone =
    new URLSearchParams(location.search).get('device') === 'phone';

  const [narrow, setNarrow] = useState(innerWidth < 720);

  const phone = forcedPhone || narrow;

  const [route, setRoute] = useState<Route>(parseRoute);

  const [nav, setNav] = useState(() => {
    const r = parseRoute();
    return ['home', 'browse', 'search', 'collection'].includes(r.type)
      ? r.type
      : 'home';
  });

  const [query, setQuery] = useState('');

  const [searchType, setSearchType] = useState('all');

  const [collectionType, setCollectionType] = useState('tracks');

  const [library, setLibrary] = useState(() => {
    try {
      return readLibrary(localStorage.getItem(storageKey));
    } catch {
      return readLibrary(null);
    }
  });

  const [queue, setQueue] = useState<string[]>(playlists[0].ids);

  const [index, setIndex] = useState(0);

  const [selection, setSelection] = useState(0);

  const [queueSource, setQueueSource] = useState('поток / медленное утро');

  const mainRef = useRef<HTMLElement | null>(null);

  const [playerOpen, setPlayerOpen] = useState(false);

  const [queueOpen, setQueueOpen] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [systemLight, setSystemLight] = useState(
    matchMedia('(prefers-color-scheme: light)').matches,
  );
  const light =
    themeMode === 'light' || (themeMode === 'system' && systemLight);
  const setLight = (next: boolean) => setThemeMode(next ? 'light' : 'dark');
  const [expandedSidebar, setExpandedSidebar] = useState(false);
  const [waveSettingsOpen, setWaveSettingsOpen] = useState(false);
  const [waveMode, setWaveMode] = useState('all');
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: light)');
    const on = () => setSystemLight(media.matches);
    media.addEventListener('change', on);
    return () => media.removeEventListener('change', on);
  }, []);

  const [reduced, setReduced] = useState(false);

  const [repeat, setRepeat] = useState(false);

  const [shuffle, setShuffle] = useState(false);

  const [mood, setMood] = useState('slow-morning');

  const [notice, setNotice] = useState('');

  const [storageError, setStorageError] = useState('');

  const autoplay = useRef(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const track = getTrack(queue[index] ?? tracks[0].id);

  const album = getAlbum(track.albumId);

  const audio = useDemoAudio(
    track.id,
    () => {
      if (index === queue.length - 1 && !repeat) return;

      let next = stepIndex(index, queue.length, 1, repeat);

      if (shuffle && queue.length > 1)
        next =
          (index + 1 + Math.floor(Math.random() * (queue.length - 1))) %
          queue.length;

      autoplay.current = true;
      setIndex(next);
      setSelection((s) => s + 1);
    },
    selection,
  );

  useEffect(() => {
    const m = matchMedia('(max-width:719px)');
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const on = () => {
      const next = parseRoute();
      setRoute(next);
      if (['home', 'browse', 'search', 'collection'].includes(next.type))
        setNav(next.type);
    };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(library));
      setStorageError('');
    } catch {
      setStorageError('изменения сохраняются только до закрытия этой вкладки.');
    }
  }, [library]);

  useEffect(() => {
    if (autoplay.current) {
      autoplay.current = false;
      void audio.start();
    }
  }, [track.id, selection]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  function notify(text: string) {
    setNotice(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNotice(''), 3000);
  }

  function goto(type: Route['type'], id?: string) {
    setRoute({ type, id });
    if (['home', 'browse', 'search', 'collection'].includes(type)) setNav(type);
    location.hash = `${type}${id ? '/' + id : ''}`;
  }

  function likeTrack(id: string) {
    setLibrary((s) => ({ ...s, likedTracks: toggle(s.likedTracks, id) }));
    notify(
      library.likedTracks.includes(id)
        ? 'трек убран из коллекции'
        : 'трек добавлен в коллекцию',
    );
  }

  function likeAlbum(id: string) {
    setLibrary((s) => ({ ...s, likedAlbums: toggle(s.likedAlbums, id) }));
    notify(
      library.likedAlbums.includes(id)
        ? 'альбом убран из коллекции'
        : 'альбом добавлен в коллекцию',
    );
  }

  function sourceLabel(ids: string[]) {
    const p = playlists.find(
      (p) =>
        p.ids.length === ids.length && p.ids.every((id, i) => id === ids[i]),
    );

    if (p) return `плейлист / ${p.title}`;

    const a = getAlbum(getTrack(ids[0]).albumId);

    return ids.every((id) => getTrack(id).albumId === a.id)
      ? `альбом / ${a.title}`
      : 'твой выбор';
  }

  function playTrack(
    id: string,
    ids: string[] = [id],
    options: PlayOptions = {},
  ) {
    setQueue(ids);
    setIndex(Math.max(0, ids.indexOf(id)));
    setQueueSource(options.source ?? sourceLabel(ids));

    if (options.toggle && track.id === id) {
      void audio.play();
      return;
    }

    autoplay.current = true;
    setSelection((s) => s + 1);
  }

  function skip(direction: -1 | 1) {
    if (direction === -1 && audio.position > 3) {
      audio.seek(0);
      return;
    }

    let next = stepIndex(index, queue.length, direction, repeat);

    if (shuffle && direction === 1 && queue.length > 1)
      next =
        (index + 1 + Math.floor(Math.random() * (queue.length - 1))) %
        queue.length;

    if (next === index) {
      audio.seek(0);
      return;
    }
    autoplay.current = audio.playing;
    setIndex(next);
    setSelection((s) => s + 1);
  }

  function playMood(id: string) {
    const list = playlists.find((p) => p.id === id) ?? playlists[0];
    setMood(id);
    playTrack(list.ids[0], list.ids, {
      source: `поток / ${list.title}`,
    });
  }

  function enqueue(id: string) {
    setQueue((s) => [...s, id]);
    notify('трек добавлен в конец очереди');
  }

  const albumProps = { goto, onPlay: playTrack, reduced };

  const trackProps = {
    goto,
    currentId: track.id,
    playing: audio.playing,
    likedTracks: library.likedTracks,
    onPlay: playTrack,
    onLike: likeTrack,
    onEnqueue: enqueue,
    source:
      route.type === 'collection'
        ? 'коллекция'
        : route.type === 'search'
          ? 'поиск'
          : undefined,
  };

  const allHits = query.trim()
    ? tracks.filter((t) => {
        const a = getAlbum(t.albumId);
        return `${t.title} ${a.title} ${a.artist} ${a.genre}`
          .toLowerCase()
          .includes(query.toLowerCase().trim());
      })
    : [];

  const albumHits = query.trim()
    ? albums.filter((a) =>
        `${a.title} ${a.artist} ${a.genre}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
      )
    : [];

  function page() {
    if (route.type === 'home')
      return (
        <section className="wave-page" aria-label="моя волна">
          <div className="wave-moods" aria-label="волна по настроению">
            {[
              'добавить энергии',
              'радостно на душе',
              'вечериниться',
              'сохранять спокойствие',
              'в работу с головой',
            ].map((title, i) => (
              <button
                key={title}
                className="wave-mood"
                onClick={() => playMood(playlists[i % 3].id)}
              >
                <span
                  className={`mood-shape mood-shape-${i}`}
                  aria-hidden="true"
                />
                <span>{title}</span>
              </button>
            ))}
          </div>
          <div className="wave-center">
            <div
              className={`wave-aura ${audio.playing ? 'aura-playing' : ''}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </div>
            <h1>моя волна</h1>
            <div className="wave-track">
              <strong>
                {audio.playing
                  ? track.title
                  : 'музыка, которая попадает в тебя'}
              </strong>
              <span>
                {audio.playing ? album.artist : 'настроится, пока ты слушаешь'}
              </span>
            </div>
            <div className="wave-transport">
              <button
                className="icon-button"
                aria-label="предыдущий трек волны"
                onClick={() => skip(-1)}
              >
                <SkipBack size={25} fill="currentColor" />
              </button>
              <motion.button
                className="wave-play"
                aria-label={
                  audio.playing ? 'приостановить волну' : 'слушать мою волну'
                }
                onClick={() =>
                  audio.playing ||
                  queueSource ===
                    `поток / ${(playlists.find((p) => p.id === mood) ?? playlists[0]).title}`
                    ? void audio.play()
                    : playMood(mood)
                }
                whileTap={{ scale: 0.9 }}
              >
                {audio.playing ? (
                  <Pause size={34} fill="currentColor" />
                ) : (
                  <Play size={34} fill="currentColor" />
                )}
              </motion.button>
              <button
                className="icon-button"
                aria-label="следующий трек волны"
                onClick={() => skip(1)}
                disabled={index === queue.length - 1 && !repeat}
              >
                <SkipForward size={25} fill="currentColor" />
              </button>
            </div>
            <button
              className="wave-settings"
              onClick={() => setWaveSettingsOpen(true)}
            >
              <Settings2 size={17} /> настроить волну
            </button>
            <p className="wave-demo">демо · синтезированные фрагменты</p>
          </div>
          <aside className="wave-now">
            <h2>сейчас в волне</h2>
            <button
              onClick={() => setPlayerOpen(true)}
              aria-label="открыть плеер волны"
            >
              <Cover album={album} />
            </button>
            <strong>{track.title}</strong>
            <button
              className="text-button secondary"
              onClick={() => goto('artist', album.artistId)}
            >
              {album.artist}
            </button>
            <button className="wave-queue" onClick={() => setQueueOpen(true)}>
              <ListMusic size={18} /> очередь воспроизведения
            </button>
          </aside>
        </section>
      );
    if (route.type === 'browse')
      return (
        <>
          <div className="page-heading">
            <h1>что послушать</h1>
          </div>
          <SectionHeader title="тебе понравится" />
          <AlbumRail label="альбомы для тебя">
            {albums.map((a) => (
              <AlbumCard {...albumProps} key={a.id} item={a} />
            ))}
          </AlbumRail>
          <SectionHeader title="твоя музыка на сегодня" />
          <ElasticGallery
            items={playlists}
            onOpen={(id) => goto('playlist', id)}
          />
          <SectionHeader title="сейчас в твоём ритме" />
          <TrackRows
            {...trackProps}
            items={tracks.filter((_, i) => i % 3 === 0)}
          />
          <SectionHeader title="собрано для тебя" />
          <div className="playlist-grid">
            {playlists.map((p) => (
              <PlaylistCard
                key={p.id}
                item={p}
                onOpen={(id) => goto('playlist', id)}
              />
            ))}
          </div>
          <div className="demo-note">
            демо-каталог · вымышленные исполнители и синтезированный звук
          </div>
        </>
      );

    if (route.type === 'search')
      return (
        <>
          <div className="page-heading">
            <span className="eyebrow">найди своё</span>
            <h1>поиск</h1>
          </div>
          <label className="search-field">
            <Search size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="трек, альбом или артист"
              aria-label="поиск музыки"
              autoFocus
            />
            {query && (
              <button
                className="icon-button"
                aria-label="очистить поиск"
                onClick={() => setQuery('')}
              >
                <X size={18} />
              </button>
            )}
          </label>
          {!query.trim() ? (
            <>
              <SectionHeader title="начни с настроения" />
              <div className="genre-grid">
                {['ambient', 'house', 'electronic', 'downtempo'].map((g, i) => (
                  <motion.button
                    key={g}
                    onClick={() => setQuery(g)}
                    className={`genre genre-${i}`}
                    whileHover={{ y: -4 }}
                  >
                    <span>{g}</span>
                    <ArrowRight size={22} />
                  </motion.button>
                ))}
              </div>
              <SectionHeader title="попробуй послушать" />
              <AlbumRail label="открытия поиска">
                {albums.slice(2).map((a) => (
                  <AlbumCard {...albumProps} key={a.id} item={a} />
                ))}
              </AlbumRail>
            </>
          ) : (
            <>
              <AnimatedTabs
                id="search-kind"
                items={[
                  { id: 'all', label: 'всё' },
                  { id: 'tracks', label: 'треки' },
                  { id: 'albums', label: 'альбомы' },
                  { id: 'artists', label: 'артисты' },
                ]}
                value={searchType}
                onChange={setSearchType}
              />
              <section
                role="tabpanel"
                aria-labelledby={`search-kind-tab-${searchType}`}
                className="search-results"
              >
                {!(searchType === 'all'
                  ? allHits.length || albumHits.length
                  : searchType === 'tracks'
                    ? allHits.length
                    : albumHits.length) ? (
                  <Empty
                    title="ничего не нашлось"
                    text="попробуй название короче или другой жанр."
                  />
                ) : (
                  <>
                    {['all', 'tracks'].includes(searchType) && (
                      <>
                        <SectionHeader title="треки" />
                        <TrackRows {...trackProps} items={allHits} />
                      </>
                    )}
                    {['all', 'albums'].includes(searchType) && (
                      <>
                        <SectionHeader title="альбомы" />
                        <div className="album-grid">
                          {albumHits.map((a) => (
                            <AlbumCard {...albumProps} key={a.id} item={a} />
                          ))}
                        </div>
                      </>
                    )}
                    {searchType === 'artists' && (
                      <div className="artist-grid">
                        {albumHits.map((a) => (
                          <button
                            key={a.artistId}
                            className="artist-card"
                            onClick={() => goto('artist', a.artistId)}
                          >
                            <div
                              className="artist-avatar"
                              style={{ background: a.color }}
                            >
                              {a.artist
                                .split(' ')
                                .map((s) => s[0])
                                .join('')}
                            </div>
                            <strong>{a.artist}</strong>
                            <small>артист</small>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </>
      );

    if (route.type === 'collection')
      return (
        <>
          <div className="page-heading collection-heading">
            <div>
              <span className="eyebrow">то, к чему хочется вернуться</span>
              <h1>коллекция</h1>
            </div>
            <motion.div
              className="collection-symbol"
              whileHover={{ rotate: -12, scale: 1.05 }}
            >
              <Bookmark size={42} strokeWidth={1} />
            </motion.div>
          </div>
          <AnimatedTabs
            id="library-kind"
            items={[
              { id: 'tracks', label: 'треки' },
              { id: 'albums', label: 'альбомы' },
              { id: 'playlists', label: 'плейлисты' },
              { id: 'artists', label: 'артисты' },
            ]}
            value={collectionType}
            onChange={setCollectionType}
          />
          <section
            className="collection-body"
            role="tabpanel"
            aria-labelledby={`library-kind-tab-${collectionType}`}
          >
            {collectionType === 'tracks' && (
              <>
                <SectionHeader
                  title="мне нравится"
                  note={`${library.likedTracks.length} демо-фрагмента`}
                />
                <TrackRows
                  {...trackProps}
                  items={tracks.filter((t) =>
                    library.likedTracks.includes(t.id),
                  )}
                />
              </>
            )}
            {collectionType === 'albums' &&
              (library.likedAlbums.length ? (
                <div className="album-grid">
                  {albums
                    .filter((a) => library.likedAlbums.includes(a.id))
                    .map((a) => (
                      <AlbumCard {...albumProps} key={a.id} item={a} />
                    ))}
                </div>
              ) : (
                <Empty
                  title="здесь будут твои альбомы"
                  text="нажми на сердечко на странице релиза."
                  action={() => goto('home')}
                  label="найти релиз"
                />
              ))}
            {collectionType === 'playlists' && (
              <PlaylistOrder
                items={playlists}
                onNotice={notify}
                render={(id) => (
                  <PlaylistCard
                    item={playlists.find((p) => p.id === id)!}
                    onOpen={(id) => goto('playlist', id)}
                  />
                )}
              />
            )}
            {collectionType === 'artists' &&
              (library.followedArtists.length ? (
                <div className="artist-grid">
                  {albums
                    .filter((a) => library.followedArtists.includes(a.artistId))
                    .map((a) => (
                      <button
                        key={a.artistId}
                        className="artist-card"
                        onClick={() => goto('artist', a.artistId)}
                      >
                        <div
                          className="artist-avatar"
                          style={{ background: a.color }}
                        >
                          {a.artist
                            .split(' ')
                            .map((s) => s[0])
                            .join('')}
                        </div>
                        <strong>{a.artist}</strong>
                        <small>артист</small>
                      </button>
                    ))}
                </div>
              ) : (
                <Empty
                  title="кто будет здесь?"
                  text="сохраняй артистов на их страницах."
                />
              ))}
          </section>
        </>
      );

    if (route.type === 'album') {
      const a = getAlbum(route.id ?? ''),
        list = tracks.filter((t) => t.albumId === a.id);

      return (
        <>
          <div className="release-hero">
            <motion.div layoutId={`release-${a.id}`} className="release-art">
              <VinylReveal
                label={a.artist}
                playing={audio.playing && album.id === a.id}
              >
                <Cover album={a} />
              </VinylReveal>
            </motion.div>
            <div className="release-info">
              <span className="eyebrow">
                альбом / {a.year} / {a.genre}
              </span>
              <h1>{a.title}</h1>
              <button
                className="artist-link text-button"
                onClick={() => goto('artist', a.artistId)}
              >
                {a.artist}
                <ArrowRight size={16} />
              </button>
              <p>{a.description}</p>
              <div className="release-actions">
                <Button
                  className="primary"
                  onClick={() =>
                    playTrack(
                      list[0].id,
                      list.map((t) => t.id),
                    )
                  }
                >
                  <Play size={17} fill="currentColor" />
                  слушать
                </Button>
                <button
                  className="icon-button bordered"
                  onClick={() => likeAlbum(a.id)}
                  aria-pressed={library.likedAlbums.includes(a.id)}
                  aria-label={`${library.likedAlbums.includes(a.id) ? 'убрать' : 'сохранить'} альбом`}
                  data-active={library.likedAlbums.includes(a.id) || undefined}
                >
                  <Heart
                    fill={
                      library.likedAlbums.includes(a.id)
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>
                <Button
                  className="outline"
                  onClick={() => {
                    setQueue((s) => [...s, ...list.map((t) => t.id)]);
                    notify('альбом добавлен в очередь');
                  }}
                >
                  <Plus size={17} />в очередь
                </Button>
              </div>
              <span className="secondary release-duration">
                3 демо-фрагмента · 2:15
              </span>
            </div>
          </div>
          <TrackRows {...trackProps} items={list} />
          <SectionHeader title="рядом по звучанию" />
          <AlbumRail label="похожие релизы">
            {albums
              .filter((x) => x.id !== a.id)
              .slice(0, 4)
              .map((item) => (
                <AlbumCard {...albumProps} key={item.id} item={item} />
              ))}
          </AlbumRail>
        </>
      );
    }

    if (route.type === 'artist') {
      const a = albums.find((a) => a.artistId === route.id) ?? albums[0];
      const following = library.followedArtists.includes(a.artistId);

      return (
        <>
          <section
            className="artist-hero"
            style={{ '--artist-color': a.color } as React.CSSProperties}
          >
            <div className="artist-mark" aria-hidden="true">
              {a.artist
                .split(' ')
                .map((s) => s[0])
                .join('')}
            </div>
            <div>
              <ScrambleNote text="независимый артист" />
              <h1>{a.artist}</h1>
              <p>{a.description}</p>
              <div className="release-actions">
                <Button
                  className="primary"
                  onClick={() =>
                    playTrack(
                      tracks.find((t) => t.albumId === a.id)!.id,
                      tracks.filter((t) => t.albumId === a.id).map((t) => t.id),
                    )
                  }
                >
                  <Play size={17} fill="currentColor" />
                  слушать
                </Button>
                <Button
                  className="outline"
                  aria-pressed={following}
                  onClick={() => {
                    setLibrary((s) => ({
                      ...s,
                      followedArtists: toggle(s.followedArtists, a.artistId),
                    }));
                    notify(
                      following
                        ? 'артист убран из коллекции'
                        : 'артист добавлен в коллекцию',
                    );
                  }}
                >
                  {following ? 'в коллекции' : 'сохранить артиста'}
                </Button>
              </div>
            </div>
          </section>
          <SectionHeader title="популярное" />
          <TrackRows
            {...trackProps}
            items={tracks.filter((t) => t.albumId === a.id)}
          />
          <SectionHeader title="релизы" />
          <div className="album-grid">
            {albums
              .filter((x) => x.artistId === a.artistId)
              .map((item) => (
                <AlbumCard {...albumProps} key={item.id} item={item} />
              ))}
          </div>
        </>
      );
    }

    const p = playlists.find((p) => p.id === route.id) ?? playlists[0];

    return (
      <>
        <section className="release-hero playlist-hero">
          <div
            className="playlist-art"
            style={{ '--art-color': p.color } as React.CSSProperties}
          >
            <span>{p.title}</span>
            <Disc3 size={96} strokeWidth={1} />
          </div>
          <div className="release-info">
            <span className="eyebrow">редакционный плейлист / serein</span>
            <h1>{p.title}</h1>
            <p>музыка на один момент. без спешки и лишнего шума.</p>
            <Button
              className="primary"
              onClick={() => playTrack(p.ids[0], p.ids)}
            >
              <Play size={17} fill="currentColor" />
              слушать подборку
            </Button>
            <span className="secondary release-duration">
              6 демо-фрагментов · 4:30
            </span>
          </div>
        </section>
        <TrackRows {...trackProps} items={p.ids.map(getTrack)} />
      </>
    );
  }

  const navItems = [
    { id: 'search', label: 'поиск', icon: <Search size={23} /> },
    { id: 'home', label: 'моя волна', icon: <AudioLines size={23} /> },
    { id: 'browse', label: 'что послушать', icon: <Music2 size={23} /> },
    { id: 'collection', label: 'коллекция', icon: <Bookmark size={21} /> },
  ];

  const routeKey = `${route.type}/${route.id ?? ''}`;

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [routeKey]);

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <MotionPreferences reduced={reduced}>
        <div
          className={`app-stage ${phone ? 'phone-stage' : 'desktop-stage'}`}
          data-theme={light ? 'light' : 'dark'}
          data-reduced={reduced || undefined}
        >
          <div className="version-toolbar">
            <span>
              музыка <small>/ дизайн-пример</small>
            </span>
            <div>
              <a
                href="?device=desktop#home"
                aria-label="версия для пк"
                className={!phone ? 'active' : ''}
              >
                <Monitor size={14} />
                пк
              </a>
              <a
                href="?device=phone#home"
                aria-label="версия для телефона"
                className={phone ? 'active' : ''}
              >
                <Smartphone size={14} />
                телефон
              </a>
            </div>
          </div>
          <div
            className={`app-shell ${phone ? 'phone' : 'desktop'} ${expandedSidebar ? 'sidebar-expanded' : ''}`}
            data-route={route.type}
          >
            {!phone && (
              <aside className="sidebar">
                <button
                  className="logo text-button"
                  aria-label="открыть мою волну"
                  onClick={() => goto('home')}
                >
                  <span className="music-symbol" aria-hidden="true">
                    ✳
                  </span>
                  <span className="brand-word">музыка</span>
                </button>
                <button
                  className="sidebar-collapse icon-button"
                  aria-label={
                    expandedSidebar ? 'свернуть меню' : 'развернуть меню'
                  }
                  onClick={() => setExpandedSidebar((s) => !s)}
                >
                  <PanelLeftClose size={18} />
                </button>
                <div className="sidebar-nav">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.id}
                      className="side-link"
                      aria-label={item.label}
                      title={item.label}
                      aria-current={nav === item.id ? 'page' : undefined}
                      onClick={() => goto(item.id as Route['type'])}
                      whileHover={reduced ? undefined : { scale: 1.06 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {nav === item.id && (
                        <motion.span
                          className="side-marker"
                          layoutId="sidebar-marker"
                        />
                      )}
                      {item.icon}
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="sidebar-divider" />
                <span className="eyebrow">твои плейлисты</span>
                {playlists.map((p, i) => (
                  <button
                    className="pinned-playlist"
                    key={p.id}
                    onClick={() => goto('playlist', p.id)}
                  >
                    <span style={{ background: p.color }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {p.title}
                  </button>
                ))}
                <div className="sidebar-bottom">
                  <span className="tiny">дизайн-пример</span>
                  <Button
                    className="outline"
                    aria-label="настройки"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings2 size={16} />
                    настройки
                  </Button>
                </div>
              </aside>
            )}
            <div className="content-area">
              <header className="app-header">
                {phone ? (
                  <>
                    <button
                      className="logo text-button"
                      aria-label="открыть мою волну"
                      onClick={() => goto('home')}
                    >
                      <span className="music-symbol" aria-hidden="true">
                        ✳
                      </span>
                      <span className="brand-word">музыка</span>
                    </button>
                    <div className="header-actions">
                      <button
                        className="icon-button"
                        aria-label="переключить тему"
                        onClick={() => setLight(!light)}
                      >
                        {light ? <Moon size={20} /> : <Sun size={20} />}
                      </button>
                      <button
                        className="icon-button profile-button"
                        aria-label="настройки"
                        onClick={() => setSettingsOpen(true)}
                      >
                        <UserRound size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="header-left">
                      <button
                        className="icon-button bordered"
                        aria-label="назад"
                        onClick={() =>
                          history.length > 1 ? history.back() : goto('home')
                        }
                      >
                        <ArrowLeft size={17} />
                      </button>
                      <span className="breadcrumb">
                        {route.type === 'home'
                          ? 'моя волна'
                          : route.type === 'browse'
                            ? 'что послушать'
                            : route.type === 'search'
                              ? 'поиск'
                              : route.type === 'collection'
                                ? 'твоя коллекция'
                                : route.type === 'album'
                                  ? 'релиз'
                                  : route.type === 'artist'
                                    ? 'артист'
                                    : 'плейлист'}
                      </span>
                    </div>
                    <div className="header-actions">
                      <button
                        className="header-search"
                        onClick={() => goto('search')}
                      >
                        <Search size={16} />
                        <span>найти музыку</span>
                      </button>
                      <button
                        className="icon-button"
                        aria-label="переключить тему"
                        onClick={() => setLight(!light)}
                      >
                        {light ? <Moon size={19} /> : <Sun size={19} />}
                      </button>
                      <button
                        className="icon-button profile-button"
                        aria-label="настройки"
                        onClick={() => setSettingsOpen(true)}
                      >
                        <UserRound size={19} />
                      </button>
                    </div>
                  </>
                )}
              </header>
              <main
                ref={mainRef}
                className="main-scroll"
                key={route.type === 'search' ? 'search-scroll' : 'main-scroll'}
              >
                <PageTransition page={routeKey}>{page()}</PageTransition>
              </main>
            </div>
            <section className="player-bar" aria-label="мини-плеер">
              <button
                className="now-playing"
                onClick={() => setPlayerOpen(true)}
                aria-label="открыть полный плеер"
              >
                <motion.div layoutId="player-cover" className="mini-cover">
                  <Cover album={album} />
                </motion.div>
                <div>
                  <strong>{track.title}</strong>
                  <small>{album.artist}</small>
                </div>
              </button>
              {phone ? (
                <>
                  <button
                    className="icon-button"
                    aria-pressed={library.likedTracks.includes(track.id)}
                    aria-label="сохранить текущий трек"
                    onClick={() => likeTrack(track.id)}
                  >
                    <Heart
                      size={19}
                      fill={
                        library.likedTracks.includes(track.id)
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>
                  <button
                    className="icon-button mini-play"
                    aria-label={audio.playing ? 'пауза' : 'воспроизвести'}
                    onClick={() => void audio.play()}
                  >
                    {audio.playing ? (
                      <Pause size={23} fill="currentColor" />
                    ) : (
                      <Play size={23} fill="currentColor" />
                    )}
                  </button>
                  <div
                    className="mini-progress"
                    style={{
                      width: `${(audio.position / track.duration) * 100}%`,
                    }}
                  />
                </>
              ) : (
                <>
                  <div className="bar-center">
                    <div className="transport">
                      <button
                        className="icon-button"
                        aria-pressed={shuffle}
                        data-active={shuffle || undefined}
                        aria-label="перемешивать"
                        onClick={() => setShuffle((s) => !s)}
                      >
                        <Shuffle size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label="предыдущий трек"
                        onClick={() => skip(-1)}
                      >
                        <SkipBack size={20} />
                      </button>
                      <motion.button
                        className="icon-button play-main"
                        aria-label={audio.playing ? 'пауза' : 'воспроизвести'}
                        onClick={() => void audio.play()}
                        whileTap={{ scale: 0.88 }}
                      >
                        {audio.playing ? (
                          <Pause size={21} fill="currentColor" />
                        ) : (
                          <Play size={21} fill="currentColor" />
                        )}
                      </motion.button>
                      <button
                        className="icon-button"
                        aria-label="следующий трек"
                        onClick={() => skip(1)}
                        disabled={index === queue.length - 1 && !repeat}
                      >
                        <SkipForward size={20} />
                      </button>
                      <button
                        className="icon-button"
                        aria-pressed={repeat}
                        data-active={repeat || undefined}
                        aria-label="повторять очередь"
                        onClick={() => setRepeat((s) => !s)}
                      >
                        <Repeat size={17} />
                      </button>
                    </div>
                    <label className="bar-seek">
                      <span>{time(audio.position)}</span>
                      <input
                        type="range"
                        min="0"
                        max={track.duration}
                        step="1"
                        value={audio.position}
                        onChange={(e) => audio.seek(Number(e.target.value))}
                        aria-label="позиция воспроизведения"
                      />
                      <span>{time(track.duration)}</span>
                    </label>
                  </div>
                  <div className="bar-right">
                    <button
                      className="icon-button"
                      aria-label="очередь воспроизведения"
                      onClick={() => setQueueOpen(true)}
                    >
                      <ListMusic size={20} />
                    </button>
                    <label className="volume-control">
                      <Volume2 size={18} />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audio.volume}
                        onChange={(e) =>
                          audio.setVolume(Number(e.target.value))
                        }
                        aria-label="громкость"
                      />
                    </label>
                  </div>
                </>
              )}
            </section>
            {phone && (
              <SpringDock
                items={navItems}
                active={nav}
                onChange={(id) => goto(id as Route['type'])}
                className="mobile-nav"
              />
            )}
            <AnimatePresence>
              {notice && (
                <motion.div
                  className="toast"
                  role="status"
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6 }}
                >
                  {notice}
                </motion.div>
              )}
            </AnimatePresence>
            {(audio.error || storageError) && (
              <div className="app-error" role="alert">
                {audio.error || storageError}
                {audio.error && (
                  <Button onClick={() => void audio.play()}>
                    попробовать снова
                  </Button>
                )}
              </div>
            )}
            <MotionDialog
              open={playerOpen}
              onClose={() => setPlayerOpen(false)}
              title="сейчас играет"
              id="full-player"
            >
              <div className="full-player">
                <div className="player-origin">источник / {queueSource}</div>
                <motion.div layoutId="player-cover" className="full-cover">
                  <Cover album={album} />
                </motion.div>
                <div className="full-title">
                  <div>
                    <h2>{track.title}</h2>
                    <button
                      className="text-button secondary"
                      onClick={() => {
                        setPlayerOpen(false);
                        goto('artist', album.artistId);
                      }}
                    >
                      {album.artist}
                    </button>
                  </div>
                  <motion.button
                    className="icon-button"
                    aria-label="сохранить текущий трек"
                    aria-pressed={library.likedTracks.includes(track.id)}
                    onClick={() => likeTrack(track.id)}
                    whileTap={{ scale: 1.25 }}
                  >
                    <Heart
                      size={24}
                      fill={
                        library.likedTracks.includes(track.id)
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </motion.button>
                </div>
                <label className="full-seek">
                  <input
                    type="range"
                    min="0"
                    max={track.duration}
                    step="1"
                    value={audio.position}
                    onChange={(e) => audio.seek(Number(e.target.value))}
                    aria-label="позиция воспроизведения в полном плеере"
                  />
                  <span>
                    {time(audio.position)}
                    <span>{time(track.duration)}</span>
                  </span>
                </label>
                <div className="transport full-transport">
                  <button
                    className="icon-button"
                    aria-pressed={shuffle}
                    data-active={shuffle || undefined}
                    aria-label="перемешивать"
                    onClick={() => setShuffle((s) => !s)}
                  >
                    <Shuffle size={20} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="предыдущий трек"
                    onClick={() => skip(-1)}
                  >
                    <SkipBack size={26} fill="currentColor" />
                  </button>
                  <motion.button
                    className="icon-button play-main"
                    aria-label={audio.playing ? 'пауза' : 'воспроизвести'}
                    onClick={() => void audio.play()}
                    whileTap={{ scale: 0.9 }}
                  >
                    {audio.playing ? (
                      <Pause size={30} fill="currentColor" />
                    ) : (
                      <Play size={30} fill="currentColor" />
                    )}
                  </motion.button>
                  <button
                    className="icon-button"
                    aria-label="следующий трек"
                    onClick={() => skip(1)}
                    disabled={index === queue.length - 1 && !repeat}
                  >
                    <SkipForward size={26} fill="currentColor" />
                  </button>
                  <button
                    className="icon-button"
                    aria-pressed={repeat}
                    data-active={repeat || undefined}
                    aria-label="повторять очередь"
                    onClick={() => setRepeat((s) => !s)}
                  >
                    <Repeat size={20} />
                  </button>
                </div>
                <div className="full-bottom">
                  <Button
                    className="outline"
                    onClick={() => {
                      setPlayerOpen(false);
                      setQueueOpen(true);
                    }}
                  >
                    <ListMusic size={17} />
                    очередь
                  </Button>
                  <Button
                    className="outline"
                    onClick={() => {
                      setPlayerOpen(false);
                      goto('album', album.id);
                    }}
                  >
                    <Disc3 size={17} />к релизу
                  </Button>
                </div>
                <span className="demo-note">
                  демо-звук · фрагмент 45 секунд
                </span>
              </div>
            </MotionDialog>
            <MotionDialog
              open={waveSettingsOpen}
              onClose={() => setWaveSettingsOpen(false)}
              title="настроить волну"
              id="wave-settings"
            >
              <div className="wave-preferences">
                <p className="secondary">выбери, чего хочется сейчас</p>
                <GlassRadioGroup
                  label="характер волны"
                  items={[
                    { id: 'all', label: 'всё' },
                    { id: 'favorite', label: 'любимое' },
                    { id: 'discover', label: 'открытия' },
                  ]}
                  value={waveMode}
                  onChange={(id) => {
                    setWaveMode(id);
                    const next =
                      id === 'favorite'
                        ? 'slow-morning'
                        : id === 'discover'
                          ? 'soft-rhythm'
                          : 'after-midnight';
                    setMood(next);
                    if (audio.playing) playMood(next);
                  }}
                />
                <ElasticGallery
                  items={playlists}
                  onOpen={(id) => {
                    playMood(id);
                    setWaveSettingsOpen(false);
                  }}
                />
                <p className="demo-note">в демо меняется подборка фрагментов</p>
              </div>
            </MotionDialog>
            <MotionDialog
              open={queueOpen}
              onClose={() => setQueueOpen(false)}
              title="очередь воспроизведения"
              id="playback-queue"
            >
              <div className="queue-summary">
                {queue.length - index} фрагментов ·{' '}
                {repeat ? 'повтор включён' : 'один проход'}
              </div>
              <div className="queue-list">
                {queue.map((id, i) => {
                  const t = getTrack(id),
                    a = getAlbum(t.albumId);
                  return (
                    <motion.div
                      layout
                      key={`${id}-${i}`}
                      className={`queue-row ${i === index ? 'current' : ''}`}
                    >
                      <span className="secondary queue-count">
                        {i === index ? (
                          <Volume2 size={17} />
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>
                      <button
                        className="queue-track text-button"
                        onClick={() => {
                          if (i === index) {
                            void audio.start();
                            return;
                          }
                          autoplay.current = true;
                          setIndex(i);
                          setSelection((s) => s + 1);
                        }}
                      >
                        <strong>{t.title}</strong>
                        <small>{a.artist}</small>
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`переместить ${t.title} выше`}
                        disabled={i <= index + 1}
                        onClick={() => setQueue((s) => moveQueue(s, i, i - 1))}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`переместить ${t.title} ниже`}
                        disabled={i <= index || i === queue.length - 1}
                        onClick={() => setQueue((s) => moveQueue(s, i, i + 1))}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`удалить ${t.title} из очереди`}
                        disabled={i === index}
                        onClick={() => {
                          setQueue((s) => s.filter((_, j) => j !== i));
                          if (i < index) setIndex((s) => s - 1);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </MotionDialog>
            <MotionDialog
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              title="настройки"
              id="settings"
            >
              <div className="settings-content">
                <ProfileCard>
                  <span className="profile-avatar">
                    <UserRound size={26} />
                  </span>
                  <div>
                    <strong>твоя музыка</strong>
                    <p>настрой под себя</p>
                  </div>
                  <SkyToggle light={light} onChange={setLight} />
                </ProfileCard>
                <ThemePreviews value={themeMode} onChange={setThemeMode} />
                <label>
                  <span>уменьшить анимации</span>
                  <input
                    type="checkbox"
                    checked={reduced}
                    onChange={(e) => setReduced(e.target.checked)}
                  />
                </label>
                <label className="settings-volume">
                  <span>
                    громкость <b>{audio.volume}%</b>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audio.volume}
                    onChange={(e) => audio.setVolume(Number(e.target.value))}
                    aria-label="громкость в настройках"
                  />
                </label>
                <div className="demo-note">
                  это интерактивный прототип. авторизация, подписка и скачивание
                  настоящей музыки появятся при внедрении в приложение.
                </div>
              </div>
            </MotionDialog>
          </div>
        </div>
      </MotionPreferences>
    </MotionConfig>
  );
}

function SectionHeader({ title, note }: { title: string; note?: string }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {note && <span>{note}</span>}
    </div>
  );
}

function Empty({
  title,
  text,
  action,
  label,
}: {
  title: string;
  text: string;
  action?: () => void;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <Disc3 size={34} strokeWidth={1} />
      <h2>{title}</h2>
      <p>{text}</p>
      {action && (
        <Button className="outline" onClick={action}>
          {label}
          <ArrowRight size={16} />
        </Button>
      )}
    </div>
  );
}

type Navigate = (type: Route['type'], id?: string) => void;
type PlayTrack = (id: string, ids: string[], options?: PlayOptions) => void;

function AlbumCard({
  item,
  goto,
  onPlay,
  reduced,
}: {
  item: Album;
  goto: Navigate;
  onPlay: PlayTrack;
  reduced: boolean;
}) {
  return (
    <motion.article
      className="album-card"
      whileHover={reduced ? undefined : { y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      layout
    >
      <button
        className="cover-link"
        onClick={() => goto('album', item.id)}
        aria-label={`открыть альбом ${item.title}`}
      >
        <Cover album={item} />
      </button>
      <motion.button
        className="card-play icon-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`слушать альбом ${item.title}`}
        onClick={() =>
          onPlay(
            tracks.find((t) => t.albumId === item.id)!.id,
            tracks.filter((t) => t.albumId === item.id).map((t) => t.id),
          )
        }
      >
        <Play size={18} fill="currentColor" />
      </motion.button>
      <div className="card-caption">
        <button
          className="text-button album-title"
          onClick={() => goto('album', item.id)}
        >
          {item.title}
        </button>
        <button
          className="text-button secondary"
          onClick={() => goto('artist', item.artistId)}
        >
          {item.artist}
        </button>
      </div>
    </motion.article>
  );
}

function TrackRows({
  items,
  goto,
  currentId,
  playing,
  likedTracks,
  onPlay,
  onLike,
  onEnqueue,
  source,
  allowQueue = true,
}: {
  items: Track[];
  goto: Navigate;
  currentId: string;
  playing: boolean;
  likedTracks: string[];
  onPlay: PlayTrack;
  onLike: (id: string) => void;
  onEnqueue: (id: string) => void;
  source?: string;
  allowQueue?: boolean;
}) {
  if (!items.length)
    return (
      <Empty
        title="пока тихо"
        text="сохрани понравившийся трек — он появится здесь."
        action={() => goto('home')}
        label="найти музыку"
      />
    );
  const ids = items.map((t) => t.id);
  return (
    <div className="track-list">
      {items.map((t, i) => {
        const a = getAlbum(t.albumId),
          current = t.id === currentId;
        return (
          <motion.div
            layout
            className={`track-row ${current ? 'current' : ''}`}
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              className="track-play icon-button"
              aria-label={`слушать ${t.title}`}
              onClick={() => onPlay(t.id, ids, { toggle: true, source })}
            >
              {current && playing ? <Pause size={15} /> : <Play size={15} />}
              <span className="track-number">
                {String(i + 1).padStart(2, '0')}
              </span>
            </button>
            <button
              className="track-cover"
              aria-label={`открыть ${a.title}`}
              onClick={() => goto('album', a.id)}
            >
              <Cover album={a} />
            </button>
            <div className="track-description">
              <button
                className="text-button"
                onClick={() => onPlay(t.id, ids, { toggle: true, source })}
              >
                {t.title}
              </button>
              <button
                className="text-button secondary"
                onClick={() => goto('artist', a.artistId)}
              >
                {a.artist}
              </button>
            </div>
            <button
              className="track-album text-button secondary"
              onClick={() => goto('album', a.id)}
            >
              {a.title}
            </button>
            <span className="track-duration secondary">{time(t.duration)}</span>
            <button
              className="icon-button track-like"
              data-active={likedTracks.includes(t.id) || undefined}
              aria-pressed={likedTracks.includes(t.id)}
              aria-label={`${likedTracks.includes(t.id) ? 'убрать из коллекции' : 'сохранить'} ${t.title}`}
              onClick={() => onLike(t.id)}
            >
              <Heart
                size={18}
                fill={likedTracks.includes(t.id) ? 'currentColor' : 'none'}
              />
            </button>
            {allowQueue && (
              <button
                className="icon-button track-more"
                aria-label={`добавить ${t.title} в очередь`}
                onClick={() => onEnqueue(t.id)}
              >
                <Plus size={18} />
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function PlaylistCard({
  item,
  onOpen,
}: {
  item: (typeof playlists)[number];
  onOpen: (id: string) => void;
}) {
  return (
    <motion.button
      className="playlist-card"
      onClick={() => onOpen(item.id)}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="playlist-art"
        style={{ '--art-color': item.color } as React.CSSProperties}
      >
        <span>{item.title}</span>
        <Disc3 size={54} strokeWidth={1} />
      </div>
      <strong>{item.title}</strong>
      <small>{item.subtitle}</small>
    </motion.button>
  );
}
