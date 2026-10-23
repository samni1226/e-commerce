import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getAccount, saveAccount } from '../lib/storage';
import Loader from '../components/Loader';
import type { AccountProfile } from '../types';

const empty: AccountProfile = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
};

export default function Account() {
  const [profile, setProfile] = useState<AccountProfile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccount()
      .then((account) => {
        if (account) setProfile(account);
      })
      .catch(() => setError('Could not load your saved profile — the server may be unreachable.'))
      .finally(() => setLoading(false));
  }, []);

  function updateField<K extends keyof AccountProfile>(key: K, value: AccountProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveAccount(profile);
      setSaved(true);
    } catch {
      setError('Could not save your profile — the server may be unreachable.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading your profile…" />;

  return (
    <div className="container">
      <h1 className="page-title">Account</h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: '60ch', marginBottom: 8 }}>
        These details are saved to your OurKart account and used to pre-fill checkout.
      </p>

      {saved && <div className="status-banner success">Profile saved.</div>}
      {error && <div className="status-banner error">{error}</div>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field full">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            required
            value={profile.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
          />
        </div>
        <div className="field full">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={profile.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
        <div className="field full">
          <label htmlFor="address">Street address</label>
          <input
            id="address"
            value={profile.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input
            id="city"
            value={profile.city}
            onChange={(e) => updateField('city', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="postalCode">Postal code</label>
          <input
            id="postalCode"
            value={profile.postalCode}
            onChange={(e) => updateField('postalCode', e.target.value)}
          />
        </div>
        <div className="field full">
          <label htmlFor="country">Country</label>
          <input
            id="country"
            value={profile.country}
            onChange={(e) => updateField('country', e.target.value)}
          />
        </div>
        <div className="field full" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="stamp-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
          <Link to="/orders" className="stamp-btn ghost">
            View Order History
          </Link>
        </div>
      </form>
    </div>
  );
}
