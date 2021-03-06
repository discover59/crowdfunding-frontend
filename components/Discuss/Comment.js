import React, {Component} from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'
import {compose} from 'redux'
import withT from '../../lib/withT'
import {timeMinute} from 'd3-time'

import View from './CommentView'
import Form from './Form'

import {swissTime} from '../../lib/utils/formats'
import pollColors from '../Vote/colors'
import Share from '../Share'

import {
  Label, A, linkRule, mediaQueries
} from '@project-r/styleguide'

import {
  PUBLIC_BASE_URL
} from '../../constants'

const dateTimeFormat = swissTime.format('%e. %B %H.%M Uhr')

const styles = {
  comment: css({
    marginTop: 40,
    marginBottom: 40
  }),
  voteBox: css({
    marginLeft: 10,
    float: 'right',
    textAlign: 'center'
  }),
  share: css({
    marginTop: 10,
    [mediaQueries.mUp]: {
      marginTop: 0,
      float: 'right',
      opacity: 0,
      transition: 'opacity 150ms 150ms',
      '[data-comment]:hover &': {
        opacity: 1
      }
    }
  })
}

const UpVote = ({fill, title}) => (
  <svg fill={fill} height='24' viewBox='0 0 24 24' width='24'>
    <title>{title}</title>
    <path d='M7 14l5-5 5 5z' />
    <path d='M0 0h24v24H0z' fill='none' />
  </svg>
)
const DownVote = ({fill, title}) => (
  <svg fill={fill} height='24' viewBox='0 0 24 24' width='24'>
    <title>{title}</title>
    <path d='M7 10l5 5 5-5z' />
    <path d='M0 0h24v24H0z' fill='none' />
  </svg>
)

class Comment extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isEditing: false
    }
  }
  render () {
    const {
      data, data: {
        id, upVotes, downVotes, userVote,
        tags = []
      },
      t,
      upVote, downVote,
      feedName, feedLimit,
      maxLength, userIsEligitable,
      meta
    } = this.props
    const {
      isEditing
    } = this.state

    if (isEditing) {
      return (
        <div {...styles.comment}>
          <Form
            feedName={feedName}
            feedLimit={feedLimit}
            maxLength={maxLength}
            edit={data}
            onSave={() => {
              this.setState({
                isEditing: false
              })
            }} />
          <A href='#' onClick={(e) => {
            e.preventDefault()
            this.setState({
              isEditing: false
            })
          }}>{t('discuss/comment/editCancel')}</A>
        </div>
      )
    }

    const createdAt = new Date(data.createdAt)
    const updatedAt = new Date(data.updatedAt)
    const updateOffset = timeMinute.count(createdAt, updatedAt)
    let updateNote
    if (updateOffset > 2) {
      updateNote = t('discuss/comment/updateNote', {
        updateDate: dateTimeFormat(updatedAt)
      })
    }

    const commentColor = pollColors[tags[0]]

    return (
      <div {...styles.comment} data-comment>
        {!!id && (
          <div {...styles.voteBox}>
            <span {...linkRule}
              style={{
                opacity: !userIsEligitable || userVote === 'DOWN' ? 0.3 : 1,
                cursor: userIsEligitable ? 'pointer' : undefined
              }}
              onClick={event => {
                event.preventDefault()
                userIsEligitable && upVote()
              }}>
              <UpVote fill={commentColor} title={t('discuss/comment/upVote')} />
            </span><br />
            <span title={`${upVotes} - ${downVotes}`}>
              {upVotes - downVotes}
            </span>
            <br />
            <span {...linkRule}
              style={{
                opacity: !userIsEligitable || userVote === 'UP' ? 0.3 : 1,
                cursor: userIsEligitable ? 'pointer' : undefined
              }}
              onClick={event => {
                event.preventDefault()
                userIsEligitable && downVote()
              }}>
              <DownVote fill={commentColor} title={t('discuss/comment/downVote')} />
            </span>
          </div>
        )}
        <View t={t} feedName={feedName} {...data} />
        <Label>
          {[
            dateTimeFormat(createdAt),
            updateNote
          ].filter(Boolean).join(', ')}
          {!!data.userCanEdit && (<span>
            <br />
            <A href='#' onClick={event => {
              event.preventDefault()
              this.setState({
                isEditing: true
              })
            }}>
              {t('discuss/comment/edit')}
            </A>
            {' – '}
            <A href='#' onClick={event => {
              event.preventDefault()
              this.props.unpublish().then(() => {
                window.location = '/vote'
              })
            }}>
              {t('discuss/comment/unpublish')}
            </A>
          </span>)}
        </Label>
        {!!id && (
          <div {...styles.share}>
            <Share
              fill={commentColor || '#000'}
              download={data.smImage}
              url={`${PUBLIC_BASE_URL}/vote?id=${id}`}
              emailSubject={meta.title}
              emailBody={data.authorName + ':\n' + data.content} />
          </div>
        )}
        <div style={{clear: 'both'}} />
      </div>
    )
  }
}

const upvote = gql`
mutation upvoteComment($commentId: ID!) {
  upvoteComment(commentId: $commentId) {
    id
    score
    upVotes
    downVotes
    userVote
  }
}
`
const downvote = gql`
mutation downvoteComment($commentId: ID!) {
  downvoteComment(commentId: $commentId) {
    id
    score
    upVotes
    downVotes
    userVote
  }
}
`
const unpublish = gql`
mutation unpublishComment($commentId: ID!) {
  unpublishComment(commentId: $commentId)
}
`

export default compose(
  graphql(unpublish, {
    props: ({mutate, ownProps}) => ({
      unpublish: () => mutate({
        variables: {
          commentId: ownProps.data.id
        }
      })
    })
  }),
  graphql(upvote, {
    props: ({mutate, ownProps}) => ({
      upVote: () => mutate({
        variables: {
          commentId: ownProps.data.id
        }
      })
    })
  }),
  graphql(downvote, {
    props: ({mutate, ownProps}) => ({
      downVote: () => mutate({
        variables: {
          commentId: ownProps.data.id
        }
      })
    })
  }),
  withT
)(Comment)
