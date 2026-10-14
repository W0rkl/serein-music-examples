import { useState } from 'react';
import { Bookmark, Disc3, Heart, Settings2 } from 'lucide-react';
import type { Library, LocalProfile as Profile } from '../../lib/model';
import { Button } from './button';

export function LocalProfile({
  profile,
  unsaved,
  library,
  onSave,
  onCollection,
  onSettings,
}: {
  profile: Profile;
  unsaved: boolean;
  library: Library;
  onSave: (profile: Profile) => boolean;
  onCollection: () => void;
  onSettings: () => void;
}) {
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [feedback, setFeedback] = useState('');
  const changed =
    nickname.trim() !== profile.nickname || avatar !== profile.avatar;
  return (
    <section className="local-profile-page">
      <div className="profile-page-heading">
        <h1>профиль</h1>
        <button
          className="icon-button"
          aria-label="настройки"
          onClick={onSettings}
        >
          <Settings2 size={22} />
        </button>
      </div>
      <div className="profile-identity">
        <div
          className={`listener-avatar avatar-${profile.avatar}`}
          aria-hidden="true"
        >
          {profile.nickname.slice(0, 1).toLocaleLowerCase()}
        </div>
        <div>
          <h2>{profile.nickname}</h2>
          <p>твоя музыка, твоё место</p>
          <span>профиль на этом устройстве</span>
        </div>
      </div>
      <div className="profile-stats" aria-label="твоя коллекция">
        <div>
          <Heart size={19} />
          <strong>{library.likedTracks.length}</strong>
          <span>треки</span>
        </div>
        <div>
          <Disc3 size={19} />
          <strong>{library.likedAlbums.length}</strong>
          <span>альбомы</span>
        </div>
        <div>
          <Bookmark size={19} />
          <strong>{library.followedArtists.length}</strong>
          <span>артисты</span>
        </div>
      </div>
      <Button
        className="outline profile-collection-link"
        onClick={onCollection}
      >
        открыть коллекцию
      </Button>
      <form
        className="profile-editor"
        onSubmit={(event) => {
          event.preventDefault();
          if (!nickname.trim()) return;
          const saved = onSave({ nickname: nickname.trim(), avatar });
          setNickname(nickname.trim());
          setFeedback(
            saved
              ? 'профиль сохранён на этом устройстве'
              : 'браузер не дал сохранить профиль. изменения останутся до закрытия вкладки.',
          );
        }}
      >
        <h2>сделать своим</h2>
        <label htmlFor="profile-nickname">никнейм</label>
        <input
          id="profile-nickname"
          value={nickname}
          maxLength={32}
          required
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setNickname(e.target.value);
            setFeedback('');
          }}
          aria-describedby="nickname-note"
        />
        <p id="nickname-note">любое имя до 32 символов</p>
        <fieldset>
          <legend>цвет аватара</legend>
          <div className="profile-avatar-options">
            {(
              [
                ['sun', 'жёлтый'],
                ['mint', 'мятный'],
                ['night', 'серый'],
              ] as const
            ).map(([id, label]) => (
              <label key={id} className={`avatar-choice avatar-${id}`}>
                <input
                  type="radio"
                  name="profile-avatar"
                  value={id}
                  aria-label={label}
                  checked={avatar === id}
                  onChange={() => {
                    setAvatar(id);
                    setFeedback('');
                  }}
                />
                <span aria-hidden="true">
                  {(nickname.trim() || 'с').slice(0, 1).toLocaleLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="profile-save">
          <Button
            type="submit"
            className="primary"
            disabled={!nickname.trim() || (!changed && !unsaved)}
          >
            сохранить профиль
          </Button>
          <p role={unsaved ? 'alert' : 'status'}>
            {unsaved
              ? 'браузер не дал сохранить профиль. попробуй ещё раз; пока изменения остаются только в этой вкладке.'
              : feedback}
          </p>
        </div>
      </form>
      <p className="profile-local-note">
        никнейм и оформление сохраняются только в этом браузере.
      </p>
    </section>
  );
}
