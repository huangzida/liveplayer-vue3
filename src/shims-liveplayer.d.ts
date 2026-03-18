declare module '@liveqing/liveplayer-v3' {
  import type { DefineComponent } from 'vue';

  const LiveQingPlayer: DefineComponent<Record<string, unknown>, {}, any>;
  export default LiveQingPlayer;
}