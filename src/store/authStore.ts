import { create } from 'zustand';
import { http } from '../api/http';

export type UserRole = {
  _id: string;
  name: string;
  // permissions object mirrors backend Role.permissions shape
  permissions: Record<string, string[]>;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roles: UserRole[];
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

type RawRolePermissions =
  | Record<string, string[]>
  | { module: string; actions: string[] }[]
  | undefined;

function normalizePermissions(permissions: RawRolePermissions): Record<string, string[]> {
  if (!permissions) return {};

  // API may send already-normalized record shape
  if (!Array.isArray(permissions)) {
    return permissions as Record<string, string[]>;
  }

  // Backend currently returns [{ module, actions }]
  return permissions.reduce<Record<string, string[]>>((acc, entry) => {
    if (entry?.module) {
      acc[entry.module] = entry.actions ?? [];
    }
    return acc;
  }, {});
}

function normalizeUser(raw: any): AuthUser {
  return {
    id: raw?.id ?? raw?._id ?? '',
    name: raw?.name ?? raw?.email ?? 'User',
    email: raw?.email ?? '',
    tenantId: raw?.tenantId ?? '',
    roles: (raw?.roles ?? []).map((role: any) => ({
      _id: role?._id ?? role?.id ?? '',
      name: role?.name ?? 'Role',
      permissions: normalizePermissions(role?.permissions)
    }))
  };
}

function normalizeAuthResponse(payload: any): AuthResponse {
  const data = payload?.data ?? payload; // API sometimes wraps in { success, data }
  return {
    user: normalizeUser(data?.user),
    accessToken: data?.accessToken ?? '',
    refreshToken: data?.refreshToken ?? ''
  };
}

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshTokens: () => Promise<string | null>;
  hasPermission: (module: string, action: string) => boolean;
};

const STORAGE_KEY = 'cdep_auth';

function persist(state: Partial<AuthState>) {
  const toStore = {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

function loadPersisted(): Pick<AuthState, 'user' | 'accessToken' | 'refreshToken'> {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, refreshToken: null };
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { user: null, accessToken: null, refreshToken: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null
    };
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initial = loadPersisted();

  return {
    user: initial.user,
    accessToken: initial.accessToken,
    refreshToken: initial.refreshToken,
    isInitializing: false,

    async login(email, password) {
      const res = await http.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = normalizeAuthResponse(res.data);
      set({ user, accessToken, refreshToken });
      persist({ user, accessToken, refreshToken });
    },

    logout() {
      set({ user: null, accessToken: null, refreshToken: null });
      persist({ user: null, accessToken: null, refreshToken: null });
    },

    async refreshTokens() {
      const { refreshToken } = get();
      if (!refreshToken) return null;
      const res = await http.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefresh } = normalizeAuthResponse(res.data);
      set({ accessToken, refreshToken: newRefresh });
      persist({ user: get().user, accessToken, refreshToken: newRefresh });
      return accessToken;
    },

    hasPermission(module, action) {
      const { user } = get();
      if (!user) return false;
      // Super Admin shortcut: any role named "Super Admin" has all permissions
      if (user.roles.some((r) => r.name === 'Super Admin')) return true;
      return user.roles.some((role) => {
        const perms = role.permissions?.[module] as string[] | undefined;
        return perms?.includes(action);
      });
    }
  };
});

