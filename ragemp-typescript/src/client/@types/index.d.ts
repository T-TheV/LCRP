declare global {
  interface PlayerMp {
    customProperty: number;
    customMethod(): void;
  }

  interface PedMp {
    playAmbientSpeechWithVoice(
      speechName: string,
      voiceName: string,
      speechParam: string,
      unk: boolean
    ): void;
  }
}

export {};
