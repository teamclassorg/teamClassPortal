import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import { Mail, Phone, User, X, Briefcase, Info, Settings, Edit } from 'react-feather';
import Select from 'react-select';
import { getUserData, isValidEmail } from '../utility/Utils';
import Cleave from 'cleave.js/react';
import { selectThemeColors } from '@utils';
import Flatpickr from 'react-flatpickr';
import mutationUpdateBooking from '../graphql/MutationUpdateBookingAndCustomer';
import mutationOpenBooking from '../graphql/MutationOpenBooking';
import mutationUpdateCalendarEventByBookindId from '../graphql/MutationUpdateCalendarEventByBookindId';
import removeCampaignRequestQuoteMutation from '../graphql/email/removeCampaignRequestQuote';
import mutationUpdateBookingNotes from '../graphql/MutationUpdateBookingNotes';
import { useMutation } from '@apollo/client';
import moment from 'moment';
import classnames from 'classnames';
import {
  BOOKING_CLOSED_STATUS,
  BOOKING_DATE_REQUESTED_STATUS,
  BOOKING_DEPOSIT_CONFIRMATION_STATUS,
  BOOKING_PAID_STATUS,
  BOOKING_QUOTE_STATUS,
  DATE_AND_TIME_RESERVED_STATUS,
  DATE_AND_TIME_CONFIRMATION_STATUS,
  DATE_AND_TIME_CANCELED_STATUS
} from '../utility/Constants';
import './EditBookingModal.scss';

const closeBookingOptions = [
  {
    label: '',
    value: ''
  },
  {
    label: 'Won',
    value: 'Won'
  },
  {
    label: 'Lost',
    value: 'Lost'
  },
  {
    label: 'Duplicated',
    value: 'Duplicated'
  },
  {
    label: 'Mistake',
    value: 'Mistake'
  },
  {
    label: 'Test',
    value: 'Test'
  }
];

const selectStyles = {
  control: (base) => ({
    ...base,
    height: 30,
    minHeight: 30,
    fontSize: 12
  }),
  option: (provided) => ({
    ...provided,
    borderBottom: '1px dotted',
    padding: 10,
    fontSize: 12
  }),
  singleValue: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: 12
  })
};


const EditBookingModal = ({
  currentElement: {
    bookingId,
    currentCustomerId,
    currentName,
    currentEmail,
    currentPhone,
    currentCompany,
    currentCoordinatorName,
    currentCoordinatorId,
    currentTeamclassId,
    currentTeamclassName,
    currentGroupSize,
    currentSignUpDeadline,
    currentClassVariant,
    currentServiceFee,
    currentSalesTax,
    createdAt,
    currentStatus,
    currentEventDurationHours,
    currentClosedReason,
    currentNotes,
    currentPayments
  },
  open,
  handleModal,
  setCustomers,
  setBookings,
  allCoordinators,
  allClasses,
  allBookings,
  allCustomers,
  allCalendarEvents,
  handleClose,
  editMode
}) => {
  const [customerName, setCustomerName] = useState(null);
  const [customerEmail, setCustomerEmail] = useState(null);
  const [emailValid, setEmailValid] = useState(true);
  const [customerPhone, setCustomerPhone] = useState(null);
  const [customerCompany, setCustomerCompany] = useState(null);
  const [coordinatorName, setCoordinatorName] = useState(null);
  const [coordinatorId, setCoordinatorId] = useState(null);
  const [bookingTeamClassId, setBookingTeamClassId] = useState(null);
  const [bookingTeamClassName, setBookingTeamClassName] = useState(null);
  const [classVariantsOptions, setClassVariantsOptions] = useState([]);
  const [classVariant, setClassVariant] = useState(null);
  const [groupSize, setGroupSize] = useState(null);
  const [attendeesValid, setAttendeesValid] = useState(true);
  const [bookingSignUpDeadline, setBookingSignUpDeadline] = useState([]);
  const [closedBookingReason, setClosedBookingReason] = useState(null);
  const [bookingNotes, setBookingNotes] = useState([]);
  const [active, setActive] = useState('1');
  const [processing, setProcessing] = useState(false);
  const [inputNote, setInputNote] = useState('');
  const [calendarEvent, setCalendarEvent] = useState(null);

  const [updateBooking] = useMutation(mutationUpdateBooking, {});
  const [removeCampaignRequestQuote] = useMutation(removeCampaignRequestQuoteMutation, {});
  const [updateCalendarEventStatus] = useMutation(mutationUpdateCalendarEventByBookindId, {});
  const [updateBookingNotes] = useMutation(mutationUpdateBookingNotes, {});
  const [updateOpenBooking] = useMutation(mutationOpenBooking, {});

  useEffect(() => {
    setCustomerName(currentName);
    setCustomerEmail(currentEmail);
    setCustomerPhone(currentPhone);
    setCustomerCompany(currentCompany);
    setCoordinatorId(currentCoordinatorId);
    setCoordinatorName(currentCoordinatorName);
    setBookingTeamClassId(currentTeamclassId);
    setBookingTeamClassName(currentTeamclassName);
    setClassVariant(currentClassVariant);
    setGroupSize(currentGroupSize);
    setBookingSignUpDeadline([currentSignUpDeadline]);
    setClosedBookingReason(currentClosedReason);
    setBookingNotes(currentNotes);

    const filteredCalendarEvent = allCalendarEvents.find((element) => element.bookingId === bookingId);
    if (filteredCalendarEvent) setCalendarEvent(filteredCalendarEvent);
  }, [bookingId]);

  useEffect(() => {
    if (bookingTeamClassId) {
      const filteredClass = allClasses.find((element) => element._id === bookingTeamClassId);
      if (filteredClass) setClassVariantsOptions(filteredClass.variants);
    }
  }, [bookingTeamClassId]);

  const emailValidation = (email) => {
    setEmailValid(isValidEmail(email));
  };

  const options = { phone: true, phoneRegionCode: 'US' };

  const cancel = () => {
    setClosedBookingReason(null);
    handleModal();
  };

  const groupSizeValidation = (size) => {
    setAttendeesValid(size > 0);
  };

  const openBooking = async () => {
    setProcessing(true);

    try {
      const reOpenBookingStatus = getStatusToReOpenBooking();
      const resultUpdateBooking = await updateOpenBooking({
        variables: {
          bookingId,
          updatedAt: new Date(),
          status: reOpenBookingStatus
        }
      });

      if (!resultUpdateBooking || !resultUpdateBooking.data) {
        setProcessing(false);
        return;
      }
      setBookings([...allBookings.filter((element) => element._id !== resultUpdateBooking.data.updateOneBooking._id)]);

      const calendarEventObject = allCalendarEvents.find((item) => item.bookingId === bookingId);
      if (reOpenBookingStatus !== BOOKING_QUOTE_STATUS && calendarEventObject && calendarEventObject.status === DATE_AND_TIME_CANCELED_STATUS) {
        const calendarEventStatus = getStatusToReOpenCalendarEvent(reOpenBookingStatus);
        const resultStatusUpdated = await updateCalendarEventStatus({
          variables: {
            calendarEventId: calendarEventObject._id,
            status: calendarEventStatus
          }
        });
        console.log('Changing calendar event status', resultStatusUpdated);
      }
    } catch (ex) {
      console.log(ex);
    }

    setProcessing(false);
    handleModal();
  };

  const saveChangesBooking = async () => {
    setProcessing(true);

    try {
      const teamClass = allClasses.find((element) => element._id === bookingTeamClassId);
      const resultUpdateBooking = await updateBooking({
        variables: {
          bookingId,
          date: new Date(), // combine with quotaTime
          teamClassId: bookingTeamClassId,
          classVariant,
          instructorId: teamClass.instructorId,
          instructorName: teamClass.instructorName,
          customerId: currentCustomerId,
          customerName,
          eventDate: new Date(),
          eventDurationHours: classVariant.duration ? classVariant.duration : currentEventDurationHours,
          eventCoordinatorId: coordinatorId,
          attendees: groupSize,
          classMinimum: classVariant.minimum,
          pricePerson: classVariant.pricePerson,
          serviceFee: currentServiceFee,
          salesTax: currentSalesTax,
          discount: 0,
          createdAt,
          updatedAt: new Date(),
          status: closedBookingReason ? BOOKING_CLOSED_STATUS : currentStatus,
          email: customerEmail,
          phone: customerPhone,
          company: customerCompany,
          signUpDeadline: bookingSignUpDeadline && bookingSignUpDeadline.length > 0 ? bookingSignUpDeadline[0] : undefined,
          closedReason: closedBookingReason,
          notes: bookingNotes
        }
      });

      if (!resultUpdateBooking || !resultUpdateBooking.data) {
        setProcessing(false);
        return;
      }
      // Update customers object
      setCustomers([
        resultUpdateBooking.data.updateOneCustomer,
        ...allCustomers.filter((element) => element._id !== resultUpdateBooking.data.updateOneCustomer._id)
      ]);

      if (closedBookingReason) {
        const resultEmail = await removeCampaignRequestQuote({
          variables: { customerEmail: customerEmail.toLowerCase() }
        });
        console.log('Remove campaign before redirecting:', resultEmail);
        setBookings([...allBookings.filter((element) => element._id !== resultUpdateBooking.data.updateOneBooking._id)]);
      } else {
        // Update bookings object
        setBookings([
          resultUpdateBooking.data.updateOneBooking,
          ...allBookings.filter((element) => element._id !== resultUpdateBooking.data.updateOneBooking._id)
        ]);
      }

      if (
        closedBookingReason === 'Lost' ||
        closedBookingReason === 'Duplicated' ||
        closedBookingReason === 'Mistake' ||
        closedBookingReason === 'Test'
      ) {
        const calendarEventObject = allCalendarEvents.find((item) => item.bookingId === bookingId);
        if (calendarEventObject) {
          const resultStatusUpdated = await updateCalendarEventStatus({
            variables: {
              calendarEventId: calendarEventObject._id,
              status: DATE_AND_TIME_CANCELED_STATUS
            }
          });
          console.log('Changing calendar event status', resultStatusUpdated);
        }
      }
    } catch (ex) {
      console.log(ex);
    }

    setProcessing(false);
    handleModal();
  };

  const getStatusToReOpenBooking = () => {
    if (!calendarEvent) {
      return BOOKING_QUOTE_STATUS;
    } else if (currentPayments && currentPayments.length > 0) {
      const depositPayment =
        currentPayments && currentPayments.find((element) => element.paymentName === 'deposit' && element.status === 'succeeded');
      const finalPayment = currentPayments && currentPayments.find((element) => element.paymentName === 'final' && element.status === 'succeeded');
      if (finalPayment) {
        return BOOKING_PAID_STATUS;
      } else if (depositPayment) {
        return BOOKING_DEPOSIT_CONFIRMATION_STATUS;
      }
    }

    return BOOKING_DATE_REQUESTED_STATUS;
  };

  const getStatusToReOpenCalendarEvent = (openBookingStatus) => {
    let calendarEventStatus = DATE_AND_TIME_RESERVED_STATUS;
    if (openBookingStatus === BOOKING_PAID_STATUS || openBookingStatus === BOOKING_DEPOSIT_CONFIRMATION_STATUS) {
      calendarEventStatus = DATE_AND_TIME_CONFIRMATION_STATUS;
    }
    return calendarEventStatus;
  };

  const saveNotes = async () => {
    setProcessing(true);
    const newArray = bookingNotes ? [...bookingNotes] : [];
    const userData = getUserData();
    newArray.unshift({
      note: inputNote,
      author: (userData && userData.customData && userData.customData['name']) || 'Unknown',
      date: new Date()
    });

    try {
      const resultNotesUpdated = await updateBookingNotes({
        variables: {
          id: bookingId,
          notes: newArray,
          updatedAt: new Date()
        }
      });
      setBookingNotes(newArray.sort((a, b) => (a.date > b.date ? -1 : 1)));
      setBookings([
        resultNotesUpdated.data.updateOneBooking,
        ...allBookings.filter((element) => element._id !== resultNotesUpdated.data.updateOneBooking._id)
      ]);
    } catch (ex) {
      console.log(ex);
    }
    setProcessing(false);
  };

  const CloseBtn = <X className="cursor-pointer" size={15} onClick={cancel} />;

  const toggle = (tab) => {
    if (active !== tab) {
      setActive(tab);
    }
  };

  const onChangeNotes = () => {
    saveNotes();
    setInputNote('');
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      height: 30,
      minHeight: 30,
      fontSize: 12
    }),
    option: (provided) => ({
      ...provided,
      borderBottom: '1px dotted',
      padding: 10,
      fontSize: 12
    }),
    singleValue: (provided) => ({
      ...provided,
      padding: 0,
      paddingBottom: 7,
      fontSize: 12
    })
  };


  return (
    <Modal
      isOpen={open}
      toggle={handleModal}
      className="sidebar-sm"
      modalClassName="modal-slide-in"
      contentClassName="pt-0"
      onClosed={(e) => handleClose()}
    >
      <ModalHeader toggle={handleModal} close={CloseBtn} tag="div">
        <h5 className="modal-title">Edit Booking</h5>
      </ModalHeader>
      <Nav tabs className="d-flex justify-content-around mt-1">
        <NavItem>
          <NavLink
            title="Basic information"
            active={active === '1'}
            onClick={() => {
              toggle('1');
            }}
          >
            <Info size="18" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            title="Notes"
            active={active === '2'}
            onClick={() => {
              toggle('2');
            }}
          >
            <Edit size="18" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink title="Settings">
            <Settings size="18" />
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className="py-50" activeTab={active} color="primary">
        <TabPane tabId="1">
          <ModalBody className="flex-grow-1">
            <FormGroup>
              <Label for="full-name">
                <strong>Id:</strong> <span className="text-primary">{`${bookingId}`}</span>
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="full-name">Customer Information</Label>
              <InputGroup size="sm">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <User size={15} />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  id="full-name"
                  disabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                  placeholder="Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup size="sm">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <Mail size={15} />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  type="email"
                  id="email"
                  disabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                  placeholder="Email *"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  invalid={!emailValid}
                  onBlur={(e) => {
                    emailValidation(e.target.value);
                  }}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup size="sm">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <Phone size={15} />
                  </InputGroupText>
                </InputGroupAddon>
                <Cleave
                  className="form-control"
                  placeholder="Phone *"
                  disabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                  options={options}
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup size="sm">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <Briefcase size={15} />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  id="company"
                  disabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                  placeholder="Company"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <Label for="full-name">Event Coordinator*</Label>
              <Select
                theme={selectThemeColors}
                styles={selectStyles}
                isDisabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                className="react-select"
                classNamePrefix="select"
                placeholder="Select..."
                value={{
                  label: coordinatorName,
                  value: coordinatorId
                }}
                options={
                  allCoordinators &&
                  allCoordinators.map((item) => {
                    return {
                      value: item._id,
                      label: item.name
                    };
                  })
                }
                onChange={(option) => {
                  setCoordinatorId(option.value);
                  setCoordinatorName(option.label);
                }}
                isClearable={false}
              />
            </FormGroup>
            <FormGroup>
              <Label for="full-name">Event Details*</Label>
              <Select
                styles={selectStyles}
                isDisabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                theme={selectThemeColors}
                className="react-select"
                classNamePrefix="select"
                placeholder="Select one class"
                options={
                  allClasses &&
                  allClasses.map((element) => {
                    return {
                      value: element._id,
                      label: element.title
                    };
                  })
                }
                value={{
                  value: bookingTeamClassId || '',
                  label: bookingTeamClassName
                }}
                onChange={(option) => {
                  setClassVariant(null);
                  setBookingTeamClassId(option.value);
                  setBookingTeamClassName(option.label);
                }}
                isClearable={false}
              />
            </FormGroup>

            <FormGroup>
              <Label for="full-name">Class Variant*</Label>
              <Select
                theme={selectThemeColors}
                isDisabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                styles={selectStyles}
                className="react-select"
                classNamePrefix="select"
                placeholder="Select..."
                value={{
                  label: classVariant && `${classVariant.title} $${classVariant.pricePerson}${classVariant.groupEvent ? '/group' : '/person'}`,
                  value: classVariant
                }}
                options={
                  classVariantsOptions &&
                  classVariantsOptions.map((element) => {
                    return {
                      value: element,
                      label: `${element.title} $${element.pricePerson}${element.groupEvent ? '/group' : '/person'}`
                    };
                  })
                }
                onChange={(option) => setClassVariant(option.value)}
                isClearable={false}
              />
            </FormGroup>
            <FormGroup>
              <Label for="full-name">Group Size*</Label>
              <InputGroup size="sm">
                <Input
                  id="attendees"
                  disabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                  placeholder="Group Size *"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  type="number"
                  onBlur={(e) => {
                    groupSizeValidation(e.target.value);
                  }}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <Label for="date-time-picker">Sign Up Deadline (Custom)</Label>
              <InputGroup size="sm">
                <Flatpickr
                  disabled={currentStatus === BOOKING_CLOSED_STATUS ? true : false}
                  value={bookingSignUpDeadline}
                  dateformat="Y-m-d H:i"
                  data-enable-time
                  id="signUpDateLine"
                  className="form-control"
                  placeholder="Select Date..."
                  onChange={(selectedDates, dateStr, instance) => {
                    setBookingSignUpDeadline(selectedDates);
                  }}
                />
              </InputGroup>
              {bookingSignUpDeadline && currentStatus !== BOOKING_CLOSED_STATUS && (
                <dt className="text-right">
                  <small>
                    <a href="#" onClick={(e) => setBookingSignUpDeadline([])}>
                      clear
                    </a>
                  </small>
                </dt>
              )}
            </FormGroup>
            <FormGroup>
              {currentStatus === BOOKING_CLOSED_STATUS ? (
                <span className="text-lg">
                  Closed with reason: <strong>{currentClosedReason}</strong>
                </span>
              ) : (
                <>
                  <Label for="full-name">Close this booking with reason: </Label>
                  <Select
                    styles={selectStyles}
                    value={{
                      label: closedBookingReason,
                      value: closedBookingReason
                    }}
                    theme={selectThemeColors}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select one reason.."
                    options={closeBookingOptions.map((item) => {
                      return {
                        label: item.label,
                        value: item.value
                      };
                    })}
                    onChange={(option) => setClosedBookingReason(option.value)}
                    isClearable={false}
                  />
                </>
              )}
            </FormGroup>
            {editMode && (
              <div align="center">
                <Button
                  className="mr-1"
                  size="sm"
                  color={closedBookingReason ? 'danger' : 'primary'}
                  onClick={() => {
                    saveChangesBooking();
                  }}
                  disabled={
                    !customerName ||
                    !customerEmail ||
                    !emailValid ||
                    !customerPhone ||
                    !coordinatorId ||
                    !bookingTeamClassId ||
                    !classVariant ||
                    !groupSize
                  }
                >
                  {!processing && !closedBookingReason
                    ? 'Save'
                    : closedBookingReason && processing
                      ? 'Saving...'
                      : processing
                        ? 'Saving...'
                        : 'Close booking?'}
                </Button>
                <Button color="secondary" size="sm" onClick={cancel} outline>
                  Cancel
                </Button>
              </div>
            )}
            {currentStatus === BOOKING_CLOSED_STATUS && (
              <div align="center">
                <Button
                  className="mr-1"
                  size="sm"
                  color={'danger'}
                  onClick={() => {
                    openBooking();
                  }}
                  disabled={
                    !customerName ||
                    !customerEmail ||
                    !emailValid ||
                    !customerPhone ||
                    !coordinatorId ||
                    !bookingTeamClassId ||
                    !classVariant ||
                    !groupSize
                  }
                >
                  {processing ? 'Opening...' : 'Back to open status'}
                </Button>
              </div>
            )}
          </ModalBody>
        </TabPane>
        <TabPane tabId="2">
          <b className="text-primary ml-2">Notes</b>
          <Card className="notes-card mt-1">
            <CardBody>
              <ul className="timeline p-0 m-0">
                {bookingNotes && bookingNotes.length > 0 ? (
                  bookingNotes.map((item, index) => {
                    return (
                      <li key={index} className="timeline-item">
                        <span className={classnames('timeline-point timeline-point-secondary timeline-point-indicator')}>
                          {item.icon ? item.icon : null}
                        </span>
                        <div className="timeline-event">
                          <div className={classnames('d-flex justify-content-between flex-sm-row flex-column')}>
                            <small>
                              <strong>{item.author && item.author.split(' ')[0]}</strong>
                            </small>
                            <span className="timeline-event-time">
                              <small>{moment(item.date).fromNow()}</small>
                            </span>
                          </div>
                          <p
                            className={classnames({
                              'mb-0': index === bookingNotes.length - 1 && !item.customContent
                            })}
                          >
                            <small>{item.note}</small>
                          </p>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li>
                    <p>Write your first note below...</p>
                  </li>
                )}
              </ul>
            </CardBody>
          </Card>
          <div className=" ml-2 mr-2" align="right">
            <Input className="" type="textarea" id="bookingNotes" value={inputNote} onChange={(e) => setInputNote(e.target.value)} />
            <Button onClick={onChangeNotes} size="sm" className="mt-1" color="primary" disabled={!inputNote}>
              {processing ? 'Saving note...' : 'Add Note'}
            </Button>
          </div>
        </TabPane>
        <TabPane tabId="3">Settings tab</TabPane>
      </TabContent>
    </Modal>
  );
};

export default EditBookingModal;
