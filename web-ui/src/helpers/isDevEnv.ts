export default function isDevEnv(): boolean {
  return window.location.href.toLowerCase().includes('localhost');
}