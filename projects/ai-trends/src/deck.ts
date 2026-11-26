/**
 * Running order. Each slide is one file in ./slides that default-exports defineSlide({...}).
 * To add a slide: create the file, import it here, put it in the list. The URL hash uses the slide id.
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
import S2Connectors from "./slides/S2Connectors";
import S2Figma from "./slides/S2Figma";
import S2Blender from "./slides/S2Blender";
import S2Resolve from "./slides/S2Resolve";
import S2AsanaNetsuite from "./slides/S2AsanaNetsuite";
import S2Sameness from "./slides/S2Sameness";
import S2Taste from "./slides/S2Taste";
import S3Divider from "./slides/S3Divider";
import S3Blockout from "./slides/S3Blockout";
import S2Endcards from "./slides/S2Endcards";
import S4Divider from "./slides/S4Divider";
import S3Pitches from "./slides/S3Pitches";
import S3ColourLab from "./slides/S3ColourLab";
import S3Idropper from "./slides/S3Idropper";
import S3Experience from "./slides/S3Experience";
import S3Doordash from "./slides/S3Doordash";
import S4MakeAWish from "./slides/S4MakeAWish";
import S4Gallery from "./slides/S4Gallery";
import S5Divider from "./slides/S5Divider";
import S5Ranked from "./slides/S5Ranked";
import S5Context from "./slides/S5Context";
import S5Hacking from "./slides/S5Hacking";
import S3PhotoWorld from "./slides/S3PhotoWorld";
import S54dv from "./slides/S54dv";
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
  // 2 · It works where we work: connectors, then design, 3D, edit assembly, production
  S2Divider,
  S2Connectors,
  S2Figma,
  S2Blender,
  S2Resolve,
  S2AsanaNetsuite,
  S2Sameness,
  S2Taste,
  // 3 · New ways to make things
  S3Divider,
  S3Blockout,
  S2Endcards,
  // 4 · Work we made: AGO, Make-A-Wish
  S4Divider,
  S3Pitches,
  S3ColourLab,
  S3Idropper,
  S3Experience,
  S3Doordash,
  S4MakeAWish,
  S4Gallery,
  // 5 · What is next, ranked
  S5Divider,
  S5Ranked,
  S5Context,
  S5Hacking,
  S3PhotoWorld,
  S54dv,
  S5Realtime,
  // Close
  S6Reveal,
  S6Close,
  S6Questions,
  S7Contact,
];
