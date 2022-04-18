# Disaurde
Tool for building realtime camera effects with visual blocks.

![image](https://user-images.githubusercontent.com/38255514/163818147-bfed6397-0140-4ee2-a4bc-6f1e279777dc.png)

Disaurde is a browser-based realtime filter processor. It allows to create graphic filters from separate blocks with visual effects.

## Shooting mode.

The word at the top of the window is the name of the current filter. Clicking on it leads to the filter creation menu.

**↺** - generate a new filter from random elements.

**⇆** - swap the elements of the current filter.

**PLAY / PAUSE** - stop and start the filter, upper left corner shows the speed of processing (number of frames per second).

**SAVE** - save the current frame to a separate file (the resolution is shown in the lower right corner), holding the button saves several frames in burst mode.

**burst** - change the speed of burst shooting (measured in a second divided by the number of frames).

**HIDE / SHOW** - hide and show the shooting control buttons.

**A, B, C** - randomly change the parameters of all blocks of the filter:

* A is the direction of the effects;
* B - speed, area, strength of effects;
* C is the type of effects.

Holding down these buttons puts them into automatic pressing mode.

**bpm** - change the speed of automatic pressing of the A, B and C buttons (number of clicks per minute).

**=/~** - change the creation mode of all dynamic effects (constant or variable mode).

**SET** - go to the program settings menu.

## Settings menu.

**CAMERA** - the mail or frontal camera of the device.

**QUALITY** - select the resolution of the program and the size of the saved images.

**APPLY** - apply the selected settings and restart the program.

**✖** — exit from the menu while saving the previous settings.

## Filters building.

The blocks with effects are located in the upper part of the window. Selected block is added to the current filter at the bottom of the screen. The effects in the filter correspond to its name and are executed sequentially, from left to right. The DEL button deletes the last block in the filter. The OK button activates the created filter in shooting mode. The name of the filter, when clicked, returns the current filter specified at the top. The DATA button leads to the menu for saving and loading filters.

## Description of blocks.

Common:

* **Ro** — Mrrror output
* **Ri** — Mrrror input
* **Ed** — Edges
* **Ol** — Threshold
* **It** — Dithering
* **Mo** — Mosaic
* **Lu** — Blur 

Color:

* **Co** — Color Change
* **To** — Duotone
* **Hu** — Hue Shift
* **Ne** — Negative
* **Os** — Posterize

Distortion:

* **Do** — Displace Output
* **Di** — Displace Input
* **Sy** — Symmetry
* **Wa** — Wave
* **Wo** — Watercolor

Feedback:

* **Fo** — Feedback Output
* **Fi** — Feedback Input
* **Zo** — Zoom Feedback
* **Ex** — Expanding Feedback
* **De** — Channels Delay

Alpha channel:

* **So** — Threshold Shutter Output
* **Si** — Threshold Shutter Input
* **Al** — Alpha White
* **Af** — Alpha Feedback

Blend:

* **Bo** — Blend Output
* **Bi** — Blend Input
* **Li** — Lighten
* **Qu** — Quarter Mix

Stamp:

* **St** — Stamp
* **Oo** — Spots
* **Aa** — Characters and Figures
* **Um** — Thumbnails


