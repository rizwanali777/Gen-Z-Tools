export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.length;
  const blockAlign = channels * 2;
  const dataSize = samples * blockAlign;
  const array = new ArrayBuffer(44 + dataSize);
  const view = new DataView(array);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const channelData = Array.from({ length: channels }, (_, index) => buffer.getChannelData(index));
  let offset = 44;
  for (let sample = 0; sample < samples; sample += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const value = Math.max(-1, Math.min(1, channelData[channel]?.[sample] ?? 0));
      view.setInt16(offset, value < 0 ? value * 0x8000 : value * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([array], { type: "audio/wav" });
}

export function sliceAudioBuffer(buffer: AudioBuffer, startSec: number, endSec: number): AudioBuffer {
  const rate = buffer.sampleRate;
  const start = clamp(Math.floor(startSec * rate), 0, buffer.length);
  const end = clamp(Math.floor(endSec * rate), start + 1, buffer.length);
  const length = Math.max(1, end - start);
  const output = new AudioBuffer({
    length,
    numberOfChannels: buffer.numberOfChannels,
    sampleRate: rate,
  });
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    output.copyToChannel(buffer.getChannelData(channel).subarray(start, end), channel);
  }
  return output;
}

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const context = new AudioContext();
  try {
    return await context.decodeAudioData(await file.arrayBuffer());
  } finally {
    await context.close();
  }
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
