// -------------------------------------------------------
// Scriptasaurus preloads Soprano Uke chord dictionary.
// Unusual array joined to make multi-lined super string
// being used to avoid JsLint warnings about JS string
// continuation character: \
// -------------------------------------------------------
ukeGeeks.definitions.sopranoUkuleleGcea = [
	// Required: Instruement Name and Tuning (string names)
	// -------------------------------------------------------
	'{instrument: Soprano Ukulele}',
	'{tuning: G C E A}',
	//  Ab returns G#
	//  A
	// -------------------------------------------------------
	'{define: A frets 2 1 0 0 fingers 2 1 0 0}',
	'{define: Am frets 2 0 0 0 fingers 1 0 0 0}',
	'{define: A7 frets 0 1 0 0 fingers 0 1 0 0}',
	'{define: A7sus4 frets 0 2 0 0 fingers 0 2 0 0}',
	'{define: Am7 frets 0 0 0 0}',
	'{define: Adim frets 2 3 2 3 fingers 1 3 2 4}',
	'{define: Amaj7 frets 1 1 0 0 fingers 1 2 0 0}',
	'{define: A6 frets 2 4 2 4 fingers 1 3 2 4}',
	'{define: Asus2 frets 2 4 5 2 fingers 2 3 4 1}',
	'{define: Asus4 frets 2 2 0 0 fingers 1 2 0 0}',
	'{define: Aaug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: Am6 frets 2 4 2 3 fingers 1 3 1 2 add: string 2 fret 2 finger 1}',
	'{define: A9 frets 0 1 0 2 fingers 0 1 0 2}',
	//  A# retruns Bb
	//  Bb
	// -------------------------------------------------------
	'{define: Bb frets 3 2 1 1 fingers 3 2 1 1}',
	'{define: Bbm frets 3 1 1 1 fingers 3 1 1 1 add: string 1 fret 1 finger 1}',
	'{define: Bb7 frets 1 2 1 1 fingers 1 2 1 1 add: string 2 fret 1 finger 1}',
	'{define: Bb7sus4 frets 1 3 1 1 fingers 1 3 1 1 add: string 2 fret 1 finger 1}',
	'{define: Bbm7 frets 1 1 1 1 fingers 1 1 1 1}',
	'{define: Bbdim frets 0 1 0 1 fingers 0 1 0 2}',
	'{define: Bbmaj7 frets 2 2 1 1 fingers 2 2 1 1}',
	'{define: Bb6 frets 0 2 1 1 fingers 0 2 1 1}',
	'{define: Bbm6 frets 0 1 1 1 fingers 0 1 1 1}',
	'{define: Bbsus2 frets 3 0 1 1 fingers 3 0 1 1}',
	'{define: Bbsus4 frets 3 3 1 1 fingers 3 3 1 1}',
	'{define: Bbaug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}',
	'{define: Bb9 frets 1 2 1 3 fingers 2 1 4 3}',
	'{define: Bbmaj7 frets 2 2 1 1 fingers 2 2 1 1}',
	'{define: Bbm7-5 frets 1 1 0 1 fingers 1 2 0 3}',
	//  B
	// -------------------------------------------------------
	'{define: B frets 4 3 2 2 fingers 3 2 1 1}',
	'{define: Bm frets 4 2 2 2 fingers 3 1 1 1 add: string 1 fret 2 finger 1}',
	'{define: Bm6 frets 1 2 2 2 fingers 1 2 3 4}',
	'{define: B7 frets 2 3 2 2 fingers 1 2 1 1 add: string 2 fret 2 finger 1}',
	'{define: B7sus4 frets 2 4 2 2 fingers 1 3 1 1 add: string 2 fret 2 finger 1}',
	'{define: Bm7 frets 2 2 2 2 fingers 1 1 1 1}',
	'{define: Bdim frets 1 2 1 2 fingers 1 3 2 4}',
	'{define: Bmaj7 frets 3 3 2 2 fingers 2 2 1 1}',
	'{define: B6 frets 1 3 2 2 fingers 1 4 2 3}',
	'{define: Bsus2 frets 5 1 2 2 fingers 4 1 3 2}',
	'{define: Bsus4 frets 4 4 2 2 fingers 2 2 1 1}',
	'{define: Baug frets 0 3 3 2 fingers 0 2 2 1}',
	'{define: B9 frets 2 3 2 4}',
	//  C
	// -------------------------------------------------------
	'{define: C frets 0 0 0 3 fingers 0 0 0 3}',
	'{define: Cm frets 0 3 3 3 fingers 0 1 2 3}',
	'{define: C7 frets 0 0 0 1 fingers 0 0 0 1}',
	'{define: C7sus4 frets 0 0 1 1 fingers 0 0 1 1}',
	'{define: Cm7 frets 3 3 3 3 fingers 1 1 1 1}',
	'{define: Cdim frets 2 3 2 3 fingers 1 3 2 4}',
	'{define: Cmaj7 frets 0 0 0 2 fingers 0 0 0 1}',
	'{define: C6 frets 0 0 0 0}',
	'{define: Cm6 frets 0 3 5 5 fingers 0 1 3 1}',
	'{define: Csus2 frets 0 2 3 3 fingers 0 1 2 2}',
	'{define: Csus4 frets 0 0 1 3 fingers 0 0 1 3}',
	'{define: Caug frets 1 0 0 3 fingers 1 0 0 4}',
	'{define: C9 frets 0 2 0 1 fingers 0 2 0 1}',
	//  C#
	// -------------------------------------------------------
	'{define: C# frets 1 1 1 4 fingers 1 1 1 4 add: string 4 fret 1 finger 1}',
	'{define: C#m frets 1 4 4 4 fingers 1 2 3 3}',
	'{define: C#7 frets 1 1 1 2 fingers 1 1 1 2 add: string 4 fret 1 finger 1}',
	'{define: C#7sus4 frets 1 1 2 2 fingers 1 1 2 3}',
	'{define: C#m7 frets 1 4 4 2 fingers 1 3 3 2}',
	'{define: C#dim frets 0 1 0 1 fingers 0 1 0 2}',
	'{define: C#maj7 frets 1 1 1 3 fingers 1 1 1 3 add: string 4 fret 1 finger 1}',
	'{define: C#6 frets 1 1 1 1 fingers 1 1 1 1}',
	'{define: C#m6 frets 1 1 0 1 fingers 1 2 0 3}',
	'{define: C#sus2 frets 1 3 4 4 fingers 1 2 3 3}',
	'{define: C#sus4 frets 1 1 2 4 fingers 1 1 2 4}',
	'{define: C#aug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: C#9 frets 1 3 1 2}',
	//  Db returns C#
	//  D
	// -------------------------------------------------------
	'{define: D frets 2 2 2 0 fingers 1 1 1 0}',
	'{define: Dm frets 2 2 1 0 fingers 2 2 1 0}',
	'{define: Dm6 frets 0 2 1 2 fingers 0 2 1 3}',
	'{define: D7 frets 2 2 2 3 fingers 1 1 1 2 add: string 4 fret 2 finger 1}',
	'{define: D7sus4 frets 2 2 3 3 fingers 1 1 2 3}',
	'{define: Dm7 frets 2 2 1 3 fingers 2 2 1 3}',
	'{define: Ddim frets 1 2 1 2 fingers 1 3 2 4}',
	'{define: Dmaj7 frets 2 2 2 4 fingers 1 1 1 2 add: string 4 fret 2 finger 1}',
	'{define: D6 frets 2 2 2 2 fingers 2 2 2 2}',
	'{define: Dsus2 frets 2 2 0 0 fingers 1 2 0 0}',
	'{define: Dsus4 frets 0 2 3 0 fingers 0 1 2 0}',
	'{define: Daug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}',
	'{define: D9 frets 2 4 2 3}',
	//  D# returns Eb
	//  Eb
	// -------------------------------------------------------
	'{define: Eb frets 0 3 3 1 fingers 0 2 2 1}',
	'{define: Ebm frets 3 3 2 1 fingers 3 3 2 1}',
	'{define: Eb7 frets 3 3 3 4 fingers 1 1 1 2 add: string 4 fret 3 finger 1}',
	'{define: Eb7sus4 frets 3 3 4 4 fingers 1 1 2 3}',
	'{define: Ebm7 frets 3 3 2 4 fingers 2 2 1 4}',
	'{define: Ebdim frets 2 3 2 3 fingers 1 3 2 4}',
	'{define: Ebmaj7 frets 3 3 3 5 fingers 1 1 1 2 add: string 4 fret 3 finger 1}',
	'{define: Eb6 frets 3 3 3 3 fingers 1 1 1 1}',
	'{define: Ebm6 frets 3 3 2 3 fingers 2 3 1 4}',
	'{define: Ebsus2 frets 3 3 1 1 fingers 2 2 1 1}',
	'{define: Ebsus4 frets 1 3 4 1 fingers 2 3 4 1}',
	'{define: Ebaug frets 0 3 3 2 fingers 0 2 2 1}',
	'{define: Eb9 frets 0 1 1 1}',
	//  E
	// -------------------------------------------------------
	'{define: E frets 4 4 4 2 fingers 2 3 4 1}',
	'{define: Em frets 0 4 3 2 fingers 0 3 2 1}',
	'{define: E7 frets 1 2 0 2 fingers 1 2 0 3}',
	'{define: E7sus4 frets 2 2 0 2 fingers 2 3 0 4}',
	'{define: Em6 frets 4 4 3 4 fingers 2 3 1 4}',
	'{define: Em7 frets 0 2 0 2 fingers 0 1 0 2}',
	'{define: Edim frets 0 1 0 1 fingers 0 1 0 2}',
	'{define: Emaj7 frets 1 3 0 2 fingers 1 3 0 2}',
	'{define: E6 frets 4 4 4 4 fingers 1 1 1 1}',
	'{define: Esus2 frets 4 4 2 2 fingers 3 3 1 1}',
	'{define: Esus4 frets 2 4 0 2 fingers 2 4 0 1}',
	'{define: Eaug frets 1 0 0 3 fingers 1 0 0 4}',
	'{define: E9 frets 1 2 2 2}',
	//  F
	// -------------------------------------------------------
	'{define: F frets 2 0 1 0 fingers 2 0 1 0}',
	'{define: Fm frets 1 0 1 3 fingers 1 0 2 4}',
	'{define: F7 frets 2 3 1 0 fingers 2 3 1 0}',
	'{define: F7sus4 frets 3 3 1 3 fingers 2 3 1 4}',
	'{define: Fm6 frets 1 2 1 3 fingers 1 2 1 3 add: string 2 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: Fm7 frets 1 3 1 3 fingers 1 3 2 4}',
	'{define: Fdim frets 1 2 1 2 fingers 1 3 2 4}',
	'{define: Fmaj7 frets 5 5 0 0 fingers 1 2 0 0}',
	'{define: F6 frets 2 2 1 3 fingers 2 2 1 4}',
	'{define: Fsus2 frets 0 0 1 3 fingers 0 0 1 3}',
	'{define: Fsus4 frets 3 0 1 3 fingers 3 0 1 4}',
	'{define: F6sus2 frets 0 0 1 3 fingers 0 0 1 3}',
	'{define: F6sus4 frets 3 0 1 1 fingers 3 0 1 1}',
	'{define: F6aug frets 2 1 1 4 fingers 2 1 1 4 add: string 1 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: F9 frets 2 3 3 3}',
	'{define: Faug frets 2 1 1 0 fingers 3 1 2 0}',
	//  F#
	// -------------------------------------------------------
	'{define: F# frets 3 1 2 1 fingers 3 1 2 1 add: string 1 fret 1 finger 1 add: string 3 fret 1 finger 1}',
	'{define: F#m frets 2 1 2 0 fingers 2 1 3 0}',
	'{define: F#7 frets 3 4 2 4 fingers 2 3 1 4}',
	'{define: F#7sus4 frets 4 4 2 4 fingers 2 3 1 4}',
	'{define: F#m7 frets 2 4 2 4 fingers 1 3 2 4}',
	'{define: F#dim frets 2 3 2 3 fingers 1 3 2 4}',
	'{define: F#maj7 frets 3 5 2 4 fingers 2 4 1 3}',
	'{define: F#m6 frets 2 1 2 4 fingers 2 1 3 4}',
	'{define: F#6 frets 3 3 2 4 fingers 2 2 1 4}',
	'{define: F#sus2 frets 1 1 2 4 fingers 1 1 2 4}',
	'{define: F#sus4 frets 4 1 2 2 fingers 4 1 2 3}',
	'{define: F#aug frets 3 2 2 5 fingers 2 1 1 4 add: string 1 fret 2 finger 1 add: string 4 fret 2 finger 1}',
	'{define: F#9 frets 1 1 0 1}',
	//  Gb returns F#
	//  G
	// -------------------------------------------------------
	'{define: G frets 0 2 3 2 fingers 0 1 3 2}',
	'{define: Gm frets 0 2 3 1 fingers 0 2 3 1}',
	'{define: Gm6 frets 0 2 0 1 fingers 0 2 0 1}',
	'{define: G7 frets 0 2 1 2 fingers 0 2 1 3}',
	'{define: G7sus4 frets 0 2 1 3 fingers 0 2 1 4}',
	'{define: Gm7 frets 0 2 1 1 fingers 0 2 1 1}',
	'{define: Gdim frets 0 1 0 1 fingers 0 1 0 2}',
	'{define: Gmaj7 frets 0 2 2 2 fingers 0 1 2 3}',
	'{define: G6 frets 0 2 0 2 fingers 0 1 0 2}',
	'{define: Gsus2 frets 0 2 3 0 fingers 0 1 2 0}',
	'{define: Gsus4 frets 0 2 3 3 fingers 0 1 2 3}',
	'{define: Gaug frets 0 3 3 2 fingers 0 2 2 1}',
	'{define: Gsus4 frets 0 2 3 3}',
	'{define: G9 frets 2 2 1 2}',
	//  G#
	// -------------------------------------------------------
	'{define: G# frets 5 3 4 3 fingers 3 1 2 1 add: string 1 fret 3 finger 1 add: string 3 fret 3 finger 1}',
	'{define: G#m frets 1 3 4 2 fingers 1 3 4 2}',
	'{define: G#7 frets 1 3 2 3 fingers 1 3 2 4}',
	'{define: G#7sus4 frets 1 3 2 4 fingers 1 3 2 4}',
	'{define: G#m7 frets 1 3 2 2 fingers 1 4 2 3}',
	'{define: G#dim frets 1 2 1 2 fingers 1 3 2 4}',
	'{define: G#maj7 frets 1 3 3 3 fingers 1 2 2 3}',
	'{define: G#6 frets 1 3 1 3 fingers 1 3 2 4}',
	'{define: G#m6 frets 1 3 1 2 fingers 1 3 1 2 add: string 2 fret 1 finger 1 add: string 4 fret 1 finger 1}',
	'{define: G#sus2 frets 1 3 4 1 fingers 2 3 4 1}',
	'{define: G#sus4 frets 1 3 4 4 fingers 1 2 3 3}',
	'{define: G#aug frets 1 0 0 3 fingers 1 0 0 4}',
	'{define: G#9 frets 1 0 2 1 fingers 1 0 3 2}',
	//  slash chords & other oddities
	// -------------------------------------------------------
	'{define: C-F frets 2 0 1 3}',
	'{define: D/A frets 2 2 2 0}',
	'{define: Dm/C frets 2 2 1 3}',
	'{define: Fm7/C frets 1 3 1 3}',
	'{define: G/B frets 0 2 3 2}',
	'{define: G/F# frets 0 2 2 2}',
	'{define: G/F frets 0 2 1 2}',
	'{define: G7/B frets 0 2 1 2}'
];
