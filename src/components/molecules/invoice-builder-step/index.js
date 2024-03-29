// @packages
import React, { Fragment } from "react";
import NumberInput from "@components/number-input";
import { DollarSign, MinusCircle, PlusCircle } from "react-feather";
import { Input, Button, Card, Col, Row, Table, CardLink, CustomInput, CardText } from "reactstrap";
import { useMutation } from "@apollo/client";
import Avatar from "@components/avatar";
import PropTypes from "prop-types";

// @scripts
import { BOOKING_CLOSED_STATUS, BOOKING_PAID_STATUS, RUSH_FEE, SALES_TAX, SALES_TAX_STATE } from "@utility/Constants";
import mutationUpdateBookingInvoiceDetails from "@graphql/MutationUpdateBookingInvoiceDetails";
import { calculateVariantPrice } from "@services/BookingService";

const InvoiceBuilder = ({ realCountAttendees, booking, setBooking, calendarEvent }) => {
  const defaultInvoiceItems = [
    {
      item: "Initial Deposit",
      unitPrice: 0,
      units: 1,
      priceEditable: false,
      unitsEditable: false,
      taxable: true,
      readOnly: true
    },
    {
      item: "Class / Attendees",
      unitPrice: 0,
      units: 1,
      priceEditable: true,
      unitsEditable: true,
      taxable: true,
      readOnly: true
    }
  ];

  const [processing, setProcessing] = React.useState(false);
  const [taxExempt, setTaxExempt] = React.useState(false);
  const [ccFeeExempt, setCcFeeExempt] = React.useState(false);
  const [rushFee, setRushFee] = React.useState(false);
  const [classMinimum, setClassMinimum] = React.useState(1);
  const [formValid, setFormValid] = React.useState(true);
  const [invoiceItems, setInvoiceItems] = React.useState([]);
  const [discount, setDiscount] = React.useState(0);
  const [hasFinalPayment, setHasFinalPayment] = React.useState(false);
  const [updateBooking, { ...updateBookingResult }] = useMutation(mutationUpdateBookingInvoiceDetails, {});

  React.useEffect(() => {
    if (booking) {
      const depositsPaid = booking.payments?.filter((element) => element.paymentName === "deposit" && element.status === "succeeded");
      const depositAmountPaid = depositsPaid?.reduce((previous, current) => previous + current.amount - (current?.refund?.refundAmount || 0), 0) || 0;
      defaultInvoiceItems[0].unitPrice = depositAmountPaid / 100;

      if (booking?.invoiceDetails?.length > 0) {
        setInvoiceItems(
          booking.invoiceDetails.map((invoiceItem, index) => {
            return index === 0 ? { ...defaultInvoiceItems[0] } : { ...invoiceItem };
          })
        );
        const currentDiscount = booking.discount > 0 ? booking.discount * 100 : 0;
        setDiscount(currentDiscount);
      } else {
        const minimum = booking.classVariant ? booking.classVariant.minimum : booking.classMinimum;
        //pricePerson is currently in use for group based pricing too
        const price = booking.classVariant ? booking.classVariant.pricePerson : booking.pricePerson;
        const attendees = realCountAttendees > 0 ? realCountAttendees : booking.attendees;
        defaultInvoiceItems[1].unitPrice = price;
        defaultInvoiceItems[1].units = attendees > minimum ? attendees : minimum;
        setInvoiceItems(defaultInvoiceItems);
      }

      const finalPaymentPaid = booking?.payments?.find((element) => element.paymentName === "final" && element.status === "succeeded");
      setHasFinalPayment(finalPaymentPaid ? true : false);
      setTaxExempt(booking.taxExempt ? true : false);
      setCcFeeExempt(booking.ccFeeExempt ? true : false);
      setRushFee(calendarEvent && calendarEvent.rushFee ? true : false);
      setClassMinimum(booking.classVariant ? booking.classVariant.minimum : 1);
    }
  }, [booking, calendarEvent]);

  React.useEffect(() => {
    if (invoiceItems) {
      let i = 0;
      let valid = true;
      while (i < invoiceItems.length && valid) {
        const current = invoiceItems[i++];
        valid = current.item && current.item.length > 0 && !isNaN(current.unitPrice) && current.units > 0;
      }

      setFormValid(valid);
    }
  }, [invoiceItems]);

  const addNewInvoiceItem = () => {
    const newInvoiceItems = [...invoiceItems];
    newInvoiceItems.push({
      item: "",
      unitPrice: 0,
      units: 1,
      priceEditable: true,
      unitsEditable: true,
      taxable: false,
      readOnly: false
    });

    setInvoiceItems(newInvoiceItems);
  };

  const removeInvoiceItem = (index) => {
    const newInvoiceItems = invoiceItems.filter((element, i) => index !== i);
    setInvoiceItems(newInvoiceItems);
  };

  const saveInvoiceDetails = async () => {
    setProcessing(true);

    try {
      const classVariantChanges = { ...booking.classVariant };
      classVariantChanges.minimum = classMinimum;

      const result = await updateBooking({
        variables: {
          bookingId: booking._id,
          invoiceDetails: invoiceItems,
          discount: discount / 100,
          taxExempt,
          ccFeeExempt,
          rushFee,
          classMinimum,
          rushFeeValue: RUSH_FEE,
          classVariant: classVariantChanges,
          salesTax: !booking.salesTax ? SALES_TAX : booking.salesTax,
          salesTaxState: !booking.salesTaxState || booking.salesTaxState === "" ? SALES_TAX_STATE : booking.salesTaxState,
          updatedAt: new Date()
        }
      });

      if (result && result.data && result.data.updateOneBooking) {
        setBooking(result.data.updateOneBooking);
      }

      console.log("booking updated");

      setProcessing(false);
    } catch (ex) {
      console.log(ex);
      setProcessing(false);
    }
  };

  const onChangeUnits = (element, newValue, index) => {
    element.units = newValue;
    //price x attendees row
    if (index === 1) {
      element.unitPrice = calculateVariantPrice(booking.classVariant, newValue)?.price || element.unitPrice;
    }
    const newInvoiceItems = [...invoiceItems];
    newInvoiceItems.splice(index, 1, element);
    setInvoiceItems(newInvoiceItems);
  };

  return (
    <Fragment>
      <Row>
        <Col lg={12}>
          <div align="right" className="pb-2">
            <CustomInput
              type="switch"
              id="rushFee"
              onClick={(e) => {
                setRushFee(e.target.checked);
              }}
              checked={rushFee}
              className="custom-control-secondary"
              label="Rush Fee?"
              name="rushFee"
              inline
            />
            <CustomInput
              type="switch"
              id="taxExempt"
              onClick={(e) => {
                setTaxExempt(e.target.checked);
              }}
              checked={taxExempt}
              className="custom-control-secondary"
              label="Tax Exempt?"
              name="taxExempt"
              inline
            />
            <CustomInput
              type="switch"
              id="ccFeeExempt"
              onClick={(e) => {
                setCcFeeExempt(e.target.checked);
              }}
              checked={ccFeeExempt}
              className="custom-control-secondary"
              label="CC Fee Exempt?"
              name="ccFeeExempt"
              inline
            />
          </div>
          <Card className="card-transaction">
            <Table responsive>
              <thead>
                <tr>
                  <th>
                    <div align="center">Item / Detail</div>
                  </th>
                  <th>
                    <div align="center">Price ($)</div>
                  </th>
                  <th>
                    <div align="center">UNITS</div>
                  </th>
                  <th>
                    <div align="center">
                      Taxable
                      <br />
                      <small>
                        {taxExempt || !booking.salesTaxState ? "" : `(${booking.salesTaxState}, ${(booking.salesTax * 100).toFixed(2)}%)`}
                      </small>
                    </div>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((element, index) => (
                  <tr key={index}>
                    <td>
                      <div className="transaction-item">
                        <Input
                          type="text"
                          bsSize="sm"
                          disabled={element.readOnly}
                          value={element.item}
                          onChange={(e) => {
                            element.item = e.target.value;
                            const newInvoiceItems = [...invoiceItems];
                            newInvoiceItems.splice(index, 1, element);
                            setInvoiceItems(newInvoiceItems);
                          }}
                        ></Input>
                      </div>
                    </td>
                    <td align="right">
                      <div className={`font-weight-bolder ${element.down ? "text-danger" : "text-default"}`}>
                        <Input
                          type="number"
                          required={true}
                          bsSize="sm"
                          disabled={!element.priceEditable}
                          value={element.unitPrice}
                          onChange={(e) => {
                            element.unitPrice = e.target.value;
                            const newInvoiceItems = [...invoiceItems];
                            newInvoiceItems.splice(index, 1, element);
                            setInvoiceItems(newInvoiceItems);
                          }}
                        ></Input>
                      </div>
                    </td>
                    <td align="center">
                      <Input
                        type="number"
                        min={1}
                        max={10000}
                        value={element.units}
                        size="sm"
                        className="w-50"
                        disabled={!element.unitsEditable}
                        required={true}
                        onChange={(e) => onChangeUnits(element, e.target.value, index)}
                      />
                    </td>
                    <td align="center">
                      <CustomInput
                        inline
                        id={`taxable-${index}`}
                        type="checkbox"
                        checked={!taxExempt && element.taxable}
                        disabled={element.readOnly || taxExempt}
                        onChange={(e) => {
                          element.taxable = e.target.checked;
                          const newInvoiceItems = [...invoiceItems];
                          newInvoiceItems.splice(index, 1, element);
                          setInvoiceItems(newInvoiceItems);
                        }}
                        className="custom-control-secondary"
                      />
                    </td>

                    <td align="center">
                      {booking && booking.status !== BOOKING_CLOSED_STATUS && (
                        <div className="d-flex">
                          {element && !element.readOnly && (
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                removeInvoiceItem(index);
                              }}
                              href="#"
                              title="Remove current line"
                            >
                              <MinusCircle size={20} />
                            </a>
                          )}
                          {index === invoiceItems.length - 1 && (
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                addNewInvoiceItem();
                              }}
                              href="#"
                              title="Add line below"
                            >
                              <PlusCircle size={20} />
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Table>
              <thead>
                <tr>
                  <th width="60%"></th>
                  <th width="20%">
                    <div align="right">
                      <CardText className="mb-0">Class Minimum (#)</CardText>
                      <NumberInput
                        min={1}
                        max={100}
                        value={(booking && booking.classVariant.minimum) || 1}
                        size="sm"
                        required={true}
                        onChange={(newValue) => {
                          setClassMinimum(newValue);
                        }}
                      />
                    </div>
                  </th>
                  <th width="20%">
                    <div align="center">
                      <CardText className="mb-0">Discount (%)</CardText>
                      <NumberInput
                        min={0}
                        max={100}
                        value={booking.discount > 0 ? booking.discount * 100 : 0}
                        size="sm"
                        required={true}
                        onChange={(newValue) => {
                          setDiscount(newValue);
                        }}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
            </Table>
          </Card>
        </Col>
      </Row>

      {booking && booking.status !== BOOKING_CLOSED_STATUS && (
        <div>
          <div className="d-flex justify-content-between">
            <span>
              <CardLink
                href={`https://www.teamclass.com/customers/events/${booking._id}?type=payment`}
                target={"_blank"}
                title={"Final payment link"}
              >
                <Avatar color="secondary" size="sm" icon={<DollarSign size={18} />} /> <small>Final payment link</small>
              </CardLink>
            </span>
            <Button.Ripple
              size="sm"
              disabled={booking.status === BOOKING_PAID_STATUS || !formValid || hasFinalPayment}
              color="primary"
              className="btn-next"
              onClick={() => saveInvoiceDetails()}
            >
              <span className="align-middle d-sm-inline-block d-none">{processing ? "Saving..." : "Save"}</span>
            </Button.Ripple>
          </div>
        </div>
      )}
    </Fragment>
  );
};

InvoiceBuilder.propTypes = {
  realCountAttendees: PropTypes.number.isRequired,
  booking: PropTypes.object,
  setBooking: PropTypes.func,
  calendarEvent: PropTypes.object
};

export default InvoiceBuilder;
