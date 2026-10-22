import { useLocalStorage } from './useLocalStorage';

const randomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `CASA-${s}`;
};

/** Nombre de usuario y Código de Hogar guardados en el teléfono. */
export function useIdentity() {
  const [userName, setUserName] = useLocalStorage<string>('med5:user', '');
  const [household, setHousehold] = useLocalStorage<string>('med5:household', randomCode);
  return {
    userName,
    setUserName: (n: string) => setUserName(n.trim().slice(0, 30)),
    household,
    setHousehold: (c: string) => setHousehold(c.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 40)),
    displayName: userName || 'Invitado',
  };
}
