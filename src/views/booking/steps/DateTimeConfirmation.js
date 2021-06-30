import React, {Fragment} from 'react'
import {AlertCircle, ArrowLeft, ArrowRight} from 'react-feather'
import {Alert, Button, Col, Form, FormGroup, Row, Badge} from 'reactstrap'
import Flatpickr from "react-flatpickr"
import moment from "moment"
import {toAmPm} from '../../../utility/Utils'
import {useMutation} from "@apollo/client"
import mutationRequestPreferredTimeNew from "../../../graphql/MutationRequestPreferredTimeNew"
import mutationRequestPreferredTimeUpdate from "../../../graphql/MutationRequestPreferredTimeUpdate"

const DEFAULT_AVAILABILITY_ALWAYS = true
const DEFAULT_AVAILABILITY = [
    {
        increment: 30,
        toMinutes: 0,
        dayOfWeek: 1,
        fromHour: 7,
        fromMinutes: 0,
        toHour: 21
    },
    {
        increment: 30,
        toMinutes: 0,
        dayOfWeek: 2,
        fromHour: 7,
        fromMinutes: 0,
        toHour: 21
    },
    {
        increment: 30,
        toMinutes: 0,
        dayOfWeek: 3,
        fromHour: 7,
        fromMinutes: 0,
        toHour: 21
    },
    {
        increment: 30,
        toMinutes: 0,
        dayOfWeek: 4,
        fromHour: 7,
        fromMinutes: 0,
        toHour: 21
    },
    {
        increment: 30,
        toMinutes: 0,
        dayOfWeek: 5,
        fromHour: 7,
        fromMinutes: 0,
        toHour: 21
    },
    {
        increment: 30,
        toMinutes: 0,
        dayOfWeek: 6,
        fromHour: 7,
        fromMinutes: 0,
        toHour: 21
    },
    {
        increment: 30,
        toMinutes: 0,
        dayOfWeek: 7,
        fromHour: 7,
        fromMinutes: 0,
        toHour: 21
    }
]

const DateTimeConfirmation = ({
                                  stepper,
                                  type,
                                  classRushFee,
                                  availableEvents,
                                  calendarEvent,
                                  setCalendarEvent,
                                  booking,
                                  teamClass
                              }) => {

    const [date, setDate] = React.useState(null)
    const [time, setTime] = React.useState(null)
    const [availableTimes, setAvailableTimes] = React.useState(null)
    const [processing, setProcessing] = React.useState(false)
    const [createCalendarEvent, {...calendarEventData}] = useMutation(mutationRequestPreferredTimeNew, {})
    const [updateCalendarEvent, {...UpdatedCalendarEventData}] = useMutation(mutationRequestPreferredTimeUpdate, {})

    const isDayBlocked = (day) => {
        return false
    }

    const isDateTooEarly = () => {

        const today = new Date()
        const reference = new Date()
        reference.setDate(today.getDate() + 5)//5 days

        return date && date.length > 0 && date[0] > today && date[0] <= reference
    }

    const isDateInThePast = () => {

        return !date || date.length === 0 ? false : date[0] <= new Date()
    }

    const isRushDate = () => {
        const today = new Date()
        const reference = new Date()
        reference.setDate(today.getDate() + 15)//15 days
        return !isDateTooEarly() && date && date.length > 0 && date[0] > today && date[0] <= reference
    }

    const isScheduledDate = () => {
        return date && calendarEvent &&
            date[0].getMonth() === calendarEvent.month - 1 &&
            date[0].getDay() === calendarEvent.day &&
            date[0].getFullYear() === calendarEvent.year
    }

    React.useEffect(() => {

        //setDate([new Date(2021, 4, 10)])
        setDate(calendarEvent ? [new Date(calendarEvent.year, calendarEvent.month - 1, calendarEvent.day)] : [new Date().setDate(new Date().getDate() + 20)])
        setTime(calendarEvent ? `${calendarEvent.fromHour}:${calendarEvent.fromMinutes === 0 ? '00' : calendarEvent.fromMinutes}` : null)

    }, [calendarEvent])

    const hasEvents = (selectedDate, fullStartHour, fullEndHour, breakBetweenClasses) => {

        if (!availableEvents) return false

        const day = selectedDate.date()
        const month = selectedDate.month() + 1
        const year = selectedDate.year()

        const calendarEvents = availableEvents.filter(element => {

            const eventFullStartHour = (element.fromHour + (element.fromMinutes / 60)) - breakBetweenClasses
            const eventFullEndHour = (element.toHour + (element.toMinutes / 60)) + breakBetweenClasses

            return element.bookingId !== booking.id && element.day === day &&
                element.month === month && element.year === year && (
                    (fullStartHour >= eventFullStartHour && fullStartHour < eventFullEndHour) ||
                    (fullEndHour >= eventFullStartHour && fullEndHour < eventFullEndHour))
        })

        return calendarEvents && calendarEvents.length > 0
    }

    console.log(time)

    const getAvailableTimes = (selectedDate) => {

        const times = []

        if (selectedDate && teamClass) {
            const availabilities = teamClass.availability && teamClass.availability.length > 0 && !DEFAULT_AVAILABILITY_ALWAYS ? teamClass.availability.filter(element => element.dayOfWeek === selectedDate.isoWeekday()) : DEFAULT_AVAILABILITY.filter(element => element.dayOfWeek === selectedDate.isoWeekday())

            for (let j = 0; j < availabilities.length; j++) {
                const availability = availabilities[j]
                const breakBetweenClasses = availability.break ? (availability.break / 60) : .5
                const incrementInHours = availability.increment / 60
                const fromHourAndMinutes = availability.fromHour + (availability.fromMinutes / 60)
                const toHourAndMinutes = availability.toHour + (availability.toMinutes / 60)
                for (let i = fromHourAndMinutes; i < toHourAndMinutes; i = i + incrementInHours) {

                    const fullEndHour = i + teamClass.duration

                    if (!hasEvents(selectedDate, i, fullEndHour, breakBetweenClasses)) {

                        const fullMinutes = i * 60
                        let eHour = Math.floor(fullMinutes / 60)
                        eHour = (eHour < 10) ? `${eHour}` : eHour
                        let eMinutes = fullMinutes % 60
                        eMinutes = (eMinutes < 10) ? `0${eMinutes}` : eMinutes

                        times.push({
                            hour: eHour,
                            minutes: eMinutes,
                            label: `${eHour}:${eMinutes}`,
                            amPm: toAmPm(eHour, eMinutes, '')
                        })
                    }
                }
            }
        }

        return times
    }

    React.useEffect(() => {

        if (date) {
            setAvailableTimes(getAvailableTimes(moment(date[0])))
        }

    }, [date])

    const saveCalendarEvent = async () => {

        setProcessing(true)

        const selectedDate = moment(date[0])
        const eventDate = moment(`${selectedDate.format("DD/MM/YYYY")} ${time}`, 'DD/MM/YYYY HH:mm')
        const newFromHour = eventDate.hour()
        const newFromMinutes = eventDate.minutes()
        const eventEnd = eventDate.add(teamClass.duration, 'hours')
        const newToHour = eventEnd.hour()
        const newToMinutes = eventEnd.minutes()

        const sameEventDate = calendarEvent && calendarEvent.id
            && selectedDate.year() === calendarEvent.year
            && selectedDate.month() + 1 === calendarEvent.month
            && selectedDate.date() === calendarEvent.day
            && newFromHour === calendarEvent.fromHour
            && newFromMinutes === calendarEvent.fromMinutes

        if (sameEventDate) {
            setProcessing(false)
            stepper.next()
            return
        }

        try {

            const calendarEventData = {
                id: calendarEvent ? calendarEvent.id : null,
                classId: teamClass.id,
                bookingId: booking.id,
                year: selectedDate.year(),
                month: selectedDate.month() + 1,
                day: selectedDate.date(),
                fromHour: newFromHour,
                fromMinutes: newFromMinutes,
                toHour: newToHour,
                toMinutes: newToMinutes,
                status: "reserved",
                isRushFee: isRushDate(),
                rushFee: classRushFee,
                bookingStatus: "date-requested",
                updatedAt: moment().format()
            }

            if (calendarEvent && calendarEvent.id) {

                const result = await updateCalendarEvent(
                    {
                        variables: calendarEventData
                    }
                )

                if (result && result.data) setCalendarEvent(result.data.updateCalendarEvent)

                console.log("calendar event updated")

            } else {
                const result = await createCalendarEvent(
                    {
                        variables: calendarEventData
                    }
                )

                if (result && result.data) setCalendarEvent(result.data.createCalendarEvent)

                console.log("calendar event created")
            }

            setProcessing(false)

            stepper.next()

        } catch (ex) {

            console.log(ex)
            setProcessing(false)

        }
    }

    return (
        <Fragment>
            <Form onSubmit={e => e.preventDefault()}>

                <div className='content-header pb-1'>
                    <h4 className='mb-0'>Select a date and time<small className='text-primary'> Tell us what's your
                        preferred time. We'll get back to you within 24h.</small></h4>
                </div>

                <Row>
                    <Col md={12} lg={4} sm={12}>
                        <FormGroup>
                            <Flatpickr
                                className='form-control hidden'
                                value={date}
                                options={{inline: true}}
                                onChange={value => {
                                    setDate(value)
                                    setTime(null)
                                }
                                }

                            />
                        </FormGroup>
                    </Col>
                    <Col md={12} lg={1} sm={12}></Col>
                    <Col md={12} lg={6} sm={12} className="py-2">
                        <Row>
                            {availableTimes && availableTimes.map((element, index) => (
                                <Button.Ripple key={`time${index}`} className="btn-sm"
                                               disabled={isDateInThePast() || isDateTooEarly()}
                                               color='primary' tag={Col} lg={4} md={6} sm={12}
                                               outline={!(time === element.label)}
                                               onClick={e => setTime(element.label)}
                                >
                                    {element.amPm}
                                </Button.Ripple>)
                            )}
                        </Row>
                        {availableTimes && availableTimes.length > 0 && (
                            <div className="pb-1 pt-1"><small className='text-default text-primary'><Badge>CT:
                                Central Time</Badge></small></div>)}
                        <div>
                            {date && date.length > 0 && (<Alert color='danger' isOpen={isRushDate()}>
                                <div className='alert-body'>
                                    <AlertCircle size={15}/>
                                    <span className='ml-1'>{classRushFee * 100}% Rush fee will be included. Additional shipping may be required.
                                  </span>
                                </div>
                            </Alert>)}
                        </div>
                    </Col>
                    <Col md={12} lg={1} sm={12}></Col>
                </Row>

                <div className='d-flex justify-content-end'>
                    <Button.Ripple color='primary' className='btn-next' onClick={() => saveCalendarEvent()}
                                   disabled={!time || !date || processing}>
                        <span
                            className='align-middle d-sm-inline-block d-none'>{processing ? "Processing..." : "Request date"}</span>
                        <ArrowRight size={14} className='align-middle ml-sm-25 ml-0'></ArrowRight>
                    </Button.Ripple>
                </div>
            </Form>
        </Fragment>
    )
}

export default DateTimeConfirmation
