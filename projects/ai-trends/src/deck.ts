/**
 * Running order. Each slide is one file in ./slides that default-exports defineSlide({...}).
 * To add a slide: create the file, import it here, put it in the list. The URL hash uses the slide's id.
 */
import type { SlideDef } from './engine/types';
import Opener from './slides/Opener';
import S0Team from './slides/S0Team';
import Agenda from './slides/Agenda';
import S1Divider from './slides/S1Divider';
import S1Throughline from './slides/S1Throughline';
import S1Human from './slides/S1Human';
import S1Goal from './slides/S1Goal';
import S1Dictation from './slides/S1Dictation';
import S2Divider from './slides/S2Divider';
import S2Blender from './slides/S2Blender';
import S2Figma from './slides/S2Figma';
import S2AsanaNetsuite from './slides/S2AsanaNetsuite';
import S2Resolve from './slides/S2Resolve';
import S2Endcards from './slides/S2Endcards';
import S2Sameness from './slides/S2Sameness';
import S2Taste from './slides/S2Taste';
import S2Chain from './slides/S2Chain';
import S3Divider from './slides/S3Divider';
import S3PhotoWorld from './slides/S3PhotoWorld';
import S3Blockout from './slides/S3Blockout';
import S3Pitches from './slides/S3Pitches';
import S3ColourLab from './slides/S3ColourLab';
import S3Idropper from './slides/S3Idropper';
import S3Experience from './slides/S3Experience';
import S3Doordash from './slides/S3Doordash';
import S4Divider from './slides/S4Divider';
import S4MakeAWish from './slides/S4MakeAWish';
import S4Maw1Inputs from './slides/maw/S4Maw1Inputs';
import S4Maw2Clips from './slides/maw/S4Maw2Clips';
import S4Maw3Figma from './slides/maw/S4Maw3Figma';
import S4Maw4Animatic from './slides/maw/S4Maw4Animatic';
import S4Maw5Site from './slides/maw/S4Maw5Site';
import S5Divider from './slides/S5Divider';
import S54dv from './slides/S54dv';
import S5Realtime from './slides/S5Realtime';
import S5Context from './slides/S5Context';
import S5Agentops from './slides/S5Agentops';
import S5Hacking from './slides/S5Hacking';
import S6Reveal from './slides/S6Reveal';
import S6Close from './slides/S6Close';
import S6Questions from './slides/S6Questions';
import S7Contact from './slides/S7Contact';

export const slides: SlideDef[] = [
  Opener,
  S0Team,
  Agenda,
  S1Divider,
  S1Throughline,
  S1Human,
  S1Goal,
  S1Dictation,
  S2Divider,
  S2Blender,
  S2Figma,
  S2AsanaNetsuite,
  S2Resolve,
  S2Endcards,
  S2Sameness,
  S2Taste,
  S2Chain,
  S3Divider,
  S3PhotoWorld,
  S3Blockout,
  S3Pitches,
  S3ColourLab,
  S3Idropper,
  S3Experience,
  S3Doordash,
  S4Divider,
  S4MakeAWish,
  S4Maw1Inputs,
  S4Maw2Clips,
  S4Maw3Figma,
  S4Maw4Animatic,
  S4Maw5Site,
  S5Divider,
  S54dv,
  S5Realtime,
  S5Context,
  S5Agentops,
  S5Hacking,
  S6Reveal,
  S6Close,
  S6Questions,
  S7Contact,
];
