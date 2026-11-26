/**
 * Every slide in the deck. Each slide is one file in ./slides that default-exports defineSlide({...}).
 * To add a slide: create the file, import it here, put it in the list. The URL hash uses the slide id.
 * The order they run in (and which are hidden) is src/order.json, edited from the slides panel (\ key): drag to
 * reorder, Hide, then "Push to main". A slide missing from order.json runs right after the slide it follows here.
 */
import type { SlideDef } from "./engine/types";
import Opener from "./slides/Opener";
import S0Team from "./slides/S0Team";
import Agenda from "./slides/Agenda";
import S1Divider from "./slides/S1Divider";
import S1Throughline from "./slides/S1Throughline";
import S1Human from "./slides/S1Human";
import S1GenMedia from "./slides/S1GenMedia";
import S1Agentic from "./slides/S1Agentic";
import S1HowWeWork from "./slides/S1HowWeWork";
import S1Goal from "./slides/S1Goal";
import S1Dictation from "./slides/S1Dictation";
import S2Divider from "./slides/S2Divider";
import S2Figma from "./slides/S2Figma";
import S2Blender from "./slides/S2Blender";
import S2Resolve from "./slides/S2Resolve";
import S2AsanaNetsuite from "./slides/S2AsanaNetsuite";
import S2Workspace from "./slides/S2Workspace";
import S2Sameness from "./slides/S2Sameness";
import S2Taste from "./slides/S2Taste";
import S3Blockout from "./slides/S3Blockout";
import S4Divider from "./slides/S4Divider";
import S3Pitches from "./slides/S3Pitches";
import S3AgoBrief from "./slides/ago/S3AgoBrief";
import S3AgoPhotos from "./slides/ago/S3AgoPhotos";
import S3ColourLab from "./slides/S3ColourLab";
import S3Idropper from "./slides/S3Idropper";
import S3Experience from "./slides/S3Experience";
import S3Doordash from "./slides/S3Doordash";
import S4MakeAWish from "./slides/S4MakeAWish";
import S4Maw1Inputs from "./slides/maw/S4Maw1Inputs";
import S4Maw2Clips from "./slides/maw/S4Maw2Clips";
import S4Maw3Figma from "./slides/maw/S4Maw3Figma";
import S4Maw4Animatic from "./slides/maw/S4Maw4Animatic";
import S4Maw5Site from "./slides/maw/S4Maw5Site";
import S5Divider from "./slides/S5Divider";
import S4Watching from "./slides/S4Watching";
import S5Context from "./slides/S5Context";
import S5Hacking from "./slides/S5Hacking";
import S3PhotoWorld from "./slides/S3PhotoWorld";
import S5Realtime from "./slides/S5Realtime";
import S6Reveal from "./slides/S6Reveal";
import S6Close from "./slides/S6Close";
import S6Questions from "./slides/S6Questions";
import S7Contact from "./slides/S7Contact";

export const slides: SlideDef[] = [
  // Intro
  Opener,
  S0Team,
  Agenda,
  // 1 · The year AI started working: setup, generative, agentic, how we work with it
  S1Divider,
  S1Throughline,
  S1Human,
  S1GenMedia,
  S1Agentic,
  S1HowWeWork,
  S1Goal,
  S1Dictation,
  // 2 · It works where we work: design, 3D, edit assembly, production
  S2Divider,
  S2Figma,
  S2Blender,
  S2Resolve,
  S2AsanaNetsuite,
  S2Workspace,
  S2Sameness,
  S2Taste,
  // 3 · Work we made: AGO, Make-A-Wish
  S4Divider,
  S3Pitches,
  S3AgoBrief,
  S3AgoPhotos,
  S3ColourLab,
  S3Experience,
  S3Doordash,
  S3Idropper,
  S4MakeAWish,
  S4Maw1Inputs,
  S4Maw2Clips,
  S4Maw3Figma,
  S4Maw4Animatic,
  S4Maw5Site,
  // 4 · What's next: what we're paying attention to at Zulu, then one slide each
  S5Divider,
  S4Watching,
  S5Context,
  S3Blockout,
  S5Hacking,
  S3PhotoWorld,
  S5Realtime,
  // 5 · Close
  S6Reveal,
  S6Close,
  S6Questions,
  S7Contact,
];
