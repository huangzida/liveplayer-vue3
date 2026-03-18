import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';

const childMethods = {
  play: vi.fn(),
  pause: vi.fn(),
  setCurrentTime: vi.fn(),
  snap: vi.fn(),
  setMuted: vi.fn(),
  setVolume: vi.fn(),
  requestFullscreen: vi.fn(),
  exitFullscreen: vi.fn(),
  toggleFullscreen: vi.fn(),
};

vi.mock('../src/runtime/load-player', () => {
  const StubPlayer = defineComponent({
    name: 'StubPlayer',
    props: {
      videoUrl: String,
      live: Boolean,
      controls: Boolean,
      timeout: Number,
      playbackRates: Array,
      playbackRate: Number,
      poster: String,
      videoTitle: String,
      stretch: Boolean,
      muted: Boolean,
    },
    emits: ['play', 'pause', 'ended', 'error', 'message', 'timeupdate', 'volumechange', 'fullscreen'],
    setup(props, { emit, expose }) {
      expose({
        ...childMethods,
        getCurrentTime: () => 12,
        isFullscreen: () => false,
        getVolume: () => 0.5,
        getMuted: () => false,
        getDuration: () => 42,
      });

      return () =>
        h(
          'button',
          {
            class: 'stub-player',
            'data-video-url': props.videoUrl,
            onClick: () => emit('play', 12),
          },
          props.videoTitle ?? 'stub-player',
        );
    },
  });

  return {
    loadPlayerComponent: vi.fn(async () => ({
      component: StubPlayer,
      assetUrls: {
        script: '/assets/liveplayer/liveplayer-lib.min.js',
        swf: '/assets/liveplayer/liveplayer.swf',
        crossdomain: '/assets/liveplayer/crossdomain.xml',
      },
    })),
  };
});

describe('LivePlayer', () => {
  it('maps the public API props to the wrapped player component and emits ready state', async () => {
    const { LivePlayer } = await import('../src');
    const wrapper = mount(LivePlayer, {
      props: {
        src: 'https://example.com/live.m3u8',
        title: 'City Cam',
        mode: 'live',
        controls: true,
        timeout: 15,
        playbackRates: [1, 2],
        playbackRate: 2,
        fit: 'fill',
      },
    });

    await nextTick();
    await nextTick();
    await nextTick();

    const stub = wrapper.get('.stub-player');
    expect(stub.attributes('data-video-url')).toBe('https://example.com/live.m3u8');
    expect(wrapper.emitted('ready')).toHaveLength(1);
    expect(wrapper.emitted('status-change')?.at(-1)).toEqual(['ready']);
    expect(wrapper.attributes('data-liveplayer-status')).toBe('ready');
  });

  it('exposes imperative controls that forward to the underlying player instance', async () => {
    const { LivePlayer } = await import('../src');
    const wrapper = mount(LivePlayer, {
      props: {
        src: 'https://example.com/video.mp4',
      },
    });

    await nextTick();
    await nextTick();

    wrapper.vm.play();
    wrapper.vm.pause();
    wrapper.vm.seek(25);
    wrapper.vm.snapshot();
    wrapper.vm.setMuted(true);
    wrapper.vm.setVolume(0.8);
    wrapper.vm.enterFullscreen();
    wrapper.vm.exitFullscreen();
    wrapper.vm.toggleFullscreen();

    expect(childMethods.play).toHaveBeenCalledTimes(1);
    expect(childMethods.pause).toHaveBeenCalledTimes(1);
    expect(childMethods.setCurrentTime).toHaveBeenCalledWith(25);
    expect(childMethods.snap).toHaveBeenCalledTimes(1);
    expect(childMethods.setMuted).toHaveBeenCalledWith(true);
    expect(childMethods.setVolume).toHaveBeenCalledWith(0.8);
    expect(childMethods.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(childMethods.exitFullscreen).toHaveBeenCalledTimes(1);
    expect(childMethods.toggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('returns to loading state when the source changes', async () => {
    const { LivePlayer } = await import('../src');
    const wrapper = mount(LivePlayer, {
      props: {
        src: 'https://example.com/video-a.mp4',
      },
    });

    await nextTick();
    await wrapper.setProps({
      src: 'https://example.com/video-b.mp4',
    });
    await nextTick();

    expect(wrapper.emitted('status-change')).toContainEqual(['loading']);
  });
});