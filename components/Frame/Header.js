import React, {Component} from 'react'
import {css, merge} from 'glamor'
import Link from 'next/link'
import Router from 'next/router'

import {
  Logo,
  Button,
  Container, Grid, Span,
  colors
} from '@project-r/styleguide'

import LoadingBar from './LoadingBar'

export const HEADER_HEIGHT = 80

const styles = {
  bar: css({
    zIndex: 10,
    position: 'fixed',
    '@media print': {
      position: 'absolute'
    },
    top: 0,
    left: 0,
    right: 0
  }),
  barSticky: css({
    backgroundColor: '#fff',
    height: HEADER_HEIGHT,
    borderBottom: `1px solid ${colors.disabled}`
  }),
  logo: css({
    paddingTop: 22,
    display: 'inline-block',
    verticalAlign: 'middle',
    lineHeight: 0
  }),
  menu: css({
    paddingTop: 22,
    display: 'inline-block',
    verticalAlign: 'middle',
    paddingLeft: 30,
    margin: 0,
    fontSize: 20,
    '& li': {
      display: 'inline-block',
      marginRight: 20
    }
  }),
  link: css({
    textDecoration: 'none',
    color: colors.text,
    ':visited': {
      color: colors.text
    },
    ':hover': {
      color: '#ccc'
    }
  })
}

class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      sticky: !this.props.cover
    }

    this.onScroll = () => {
      const y = window.pageYOffset

      const sticky = y > 200 || !this.props.cover

      if (sticky !== this.state.sticky) {
        this.setState(() => ({sticky}))
      }
    }
  }
  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
    this.onScroll()
  }
  componentDidUpdate () {
    this.onScroll()
  }
  componentWillUnmount () {
    window.removeEventListener('scroll', this.onScroll)
  }
  render () {
    const {cover} = this.props
    const {sticky} = this.state

    const barStyle = sticky
      ? merge(styles.bar, styles.barSticky)
      : styles.bar
    return (
      <div>
        <div {...barStyle}>
          <Container>
            <Grid>
              <Span m='12/18'>
                <Link href='/'>
                  <a {...styles.logo}><Logo height={sticky ? 35 : 45} /></a>
                </Link>
                <ul {...styles.menu}>
                  <li>
                    <Link href='/updates'>
                      <a {...styles.link}>Neues</a>
                    </Link>
                  </li>
                  <li>
                    <Link href='/events'>
                      <a {...styles.link}>Tournee</a>
                    </Link>
                  </li>
                  <li>
                    <Link href='/community'>
                      <a {...styles.link}>Leute</a>
                    </Link>
                  </li>
                  <li>
                    <Link href='/faq'>
                      <a {...styles.link}>FAQ</a>
                    </Link>
                  </li>
                </ul>
              </Span>
              {
                this.props.sticky.button && (
                  <Span m='6/18' style={{
                    float: 'right'
                  }}>
                    <Button big primary onClick={() => {
                      Router.push('/pledge').then(() => window.scrollTo(0, 0))
                    }}>Mitmachen</Button>
                  </Span>
                )
              }
            </Grid>
          </Container>
        </div>
        <LoadingBar />
        {cover}
      </div>
    )
  }
}

export default Header