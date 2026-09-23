import AspectImage from "../components/AspectImage";
import { allPhotos } from "../data/gallery";

const timeline = [
  {
    year: "2014",
    title: "First darkroom",
    text: "Began printing black-and-white portraits in a small shared darkroom in Xining, learning to expose for skin texture and shadow.",
  },
  {
    year: "2017",
    title: "Return to the plateau",
    text: "Moved photographic attention back to the grasslands she grew up near, starting the landscape work that became No Man's Land.",
  },
  {
    year: "2020",
    title: "Highland Pastoral begins",
    text: "Two seasons following transhumant herders in Qinghai and Xinjiang; the camera turned from empty ground to the life moving across it.",
  },
  {
    year: "2023",
    title: "The Gaze exhibited",
    text: "The Gaze, a five-year series of close portraits, shown as a solo exhibition; all three series now continue in parallel.",
  },
];

export default function AboutPage() {
  // Portrait from the same authoritative library (not a reference image).
  const portrait =
    allPhotos.find((p) => p.id === "portrait-03") ?? allPhotos[0];

  return (
    <div className="container">
      <div className="about-grid">
        <div className="about-portrait">
          <AspectImage
            src={portrait.src}
            alt={portrait.altText}
            width={portrait.width}
            height={portrait.height}
            loading="eager"
          />
        </div>

        <div className="about-copy">
          <p className="eyebrow">About</p>
          <h1>About</h1>
          <p>
            Dechen Lhamo is an independent photographer working between
            Xining and the high grasslands of the Tibetan Plateau. Her work
            moves between two distances. Up close, she makes black-and-white
            portraits that study the moment a face decides whether to trust
            the camera — the hold of a breath, the fall of light on skin.
          </p>
          <p>
            Farther away, she photographs the ground itself: ridges and
            meadows above 4,000 metres, the fog of uninhabited valleys, and
            the pastoral rhythm of cattle and herders moving through the
            seasons. The three series collected here — The Gaze, No Man's
            Land and Highland Pastoral — are made from the same conviction:
            that a photograph is strongest when it asks rather than
            declares.
          </p>

          <ol className="timeline">
            {timeline.map((item) => (
              <li className="timeline-item" key={item.year}>
                <time>{item.year}</time>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
