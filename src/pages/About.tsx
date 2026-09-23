import { Link } from 'react-router-dom'
import { getPhoto, photoUrl } from '../data/photos'

const TIMELINE: { year: string; title: string; detail: string }[] = [
  {
    year: '2013',
    title: '离开城市',
    detail: '结束纪实摄影助理的工作，第一次独自前往海拔四千米以上的牧区。',
  },
  {
    year: '2017',
    title: '《凝视》系列开始',
    detail: '在临时搭建的黑棚里拍摄黑白肖像，只留一盏侧光，讨论坦露与防备。',
  },
  {
    year: '2020',
    title: '高原驻地计划',
    detail: '与游牧家庭共同生活一整个季节，完成《高原牧歌》的早期影像。',
  },
  {
    year: '2024',
    title: '《无人之境》出版',
    detail: '五年间地貌与光线的变化结集成书，巡展于三座城市的小型画廊。',
  },
]

export default function About() {
  // Portrait from the same shared library — no extra image is introduced.
  const profile = getPhoto('portrait-02')

  return (
    <section className="section container about-page">
      <div className="about-layout">
        <div className="about-portrait">
          <span className="ratio-box" style={{ aspectRatio: `${profile.width} / ${profile.height}` }}>
            <img src={photoUrl(profile)} alt={profile.altText} />
          </span>
        </div>

        <div className="about-body">
          <header className="page-head">
            <h1 className="page-title">简介</h1>
          </header>

          <div className="about-copy">
            <p>
              Remanina Holmson，独立摄影师，长期在高海拔无人区与牧场之间往返。
              她相信留白是影像里最重要的主体，因此画面里常常没有人，
              只有雾、山脊，和还没被命名的野花。
            </p>
            <p>
              她的另一部分工作是黑白肖像。在一盏侧光与一块黑布之间，
              她记录被摄者从防备到放松的那个瞬间——那通常只有半秒。
            </p>
          </div>

          <ol className="timeline">
            {TIMELINE.map((item) => (
              <li key={item.year} className="timeline__item">
                <span className="timeline__dot" aria-hidden="true" />
                <div>
                  <p className="timeline__year">{item.year}</p>
                  <h2 className="timeline__title">{item.title}</h2>
                  <p className="timeline__detail">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <span className="gold-rule" />

          <p className="about-cta">
            关于展出、出版或一次完整的合作计划，
            <Link to="/contact" className="text-link">写信给我 →</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
