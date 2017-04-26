import React, {Component} from 'react'
import {css} from 'glamor'
import {gql, graphql} from 'react-apollo'
import {ascending} from 'd3-array'

import withT from '../../lib/withT'
import {chfFormat, countFormat} from '../../lib/utils/formats'

import {
  P, Label
} from '@project-r/styleguide'

import {timeMinute} from 'd3-time'

import Bar from './Bar'

const styles = {
  primaryNumber: css({
    display: 'block',
    marginBottom: -10,
    fontSize: 80,
    fontFamily: 'sans-serif',
    lineHeight: 1
  }),
  secondaryNumber: css({
    display: 'block',
    marginBottom: -5,
    fontSize: 43,
    fontFamily: 'sans-serif',
    lineHeight: 1
  }),
  smallNumber: css({
    display: 'block',
    marginBottom: -5,
    fontSize: 22,
    fontFamily: 'sans-serif',
    lineHeight: 1
  })
}

const query = gql`{
  crowdfunding(name: "REPUBLIK") {
    id
    goals {
      people
      money
      description
    }
    status {
      people
      money
    }
    endDate
  }
}`

class Status extends Component {
  render () {
    if ((this.props.loading || this.props.error) && !this.props.crowdfunding) {
      return null
    }

    const {crowdfunding: {goals, status, endDate}, t} = this.props
    const now = new Date()
    const end = new Date(endDate)

    const totalMinutes = timeMinute.count(now, end)
    const minutes = totalMinutes % 60
    const hours = Math.floor(totalMinutes / 60) % 24
    const days = Math.floor(totalMinutes / 60 / 24)

    if (!goals.length) {
      return
    }

    const goalsByPeople = [].concat(goals)
      .sort((a, b) => ascending(a.people, b.people))
    const goal = goalsByPeople[goalsByPeople.length - 1]

    if (this.props.compact) {
      return (
        <div style={{paddingTop: 10}}>
          <P>
            <span {...styles.smallNumber}>{status.people}</span>
            <Label>{t('status/goal/people', {
              count: goal.people
            })}</Label>
          </P>
          <Bar goals={goalsByPeople} status={status} accessor='people' />
        </div>
      )
    }

    return (
      <div>
        <P>
          <span {...styles.primaryNumber}>{status.people}</span>
          <Label>{t('status/goal/people', {
            count: goal.people
          })}</Label>
        </P>
        <Bar
          goals={goalsByPeople}
          status={status}
          accessor='people'
          format={countFormat} />
        <P>
          <span {...styles.secondaryNumber}>{chfFormat(status.money / 100)}</span>
          <Label>
            {t('status/goal/money', {
              formattedCHF: chfFormat(goal.money / 100)
            })}
          </Label>
        </P>
        <Bar
          goals={goalsByPeople}
          status={status}
          accessor='money'
          format={(value) => chfFormat(value / 100)} />
        <P>
          <span {...styles.smallNumber}>
            {end > now ? (
              [
                t.pluralize(
                  'status/time/days',
                  {
                    count: days
                  }
                ),
                t.pluralize(
                  'status/time/hours',
                  {
                    count: hours
                  }
                ),
                t.pluralize(
                  'status/time/minutes',
                  {
                    count: minutes
                  }
                )
              ].join(' ')
            ) : (
              t('status/time/ended')
            )}
          </span>
          <Label>{t('status/time/label')}</Label>
        </P>
      </div>
    )
  }
}

const StatusWithQuery = graphql(query, {
  props: ({ data }) => {
    return {
      loading: data.loading,
      error: data.error,
      crowdfunding: data.crowdfunding
    }
  },
  options: {
    pollInterval: 30000
  }
})(withT(Status))

export default StatusWithQuery
