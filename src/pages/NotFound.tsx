import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section container not-found">
      <h1 className="page-title">404</h1>
      <p className="page-lede">这张照片还在山里，没有信号。</p>
      <Link to="/" className="btn btn--solid">回到首页</Link>
    </section>
  )
}
