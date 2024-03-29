// @packages
import { useEffect, useState } from "react";
import { User, X } from "react-feather";
import { Button, Col, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { useMutation } from "@apollo/client";
import Flatpickr from "react-flatpickr";
import PropTypes from "prop-types";

// @scripts
import MutationUpdateBookingRefund from "@graphql/MutationUpdateBookingRefund";

const RefundPaymentModal = ({
  booking,
  showRefundModal,
  setShowRefundModal,
  currentPayment,
  mode,
  payments,
  setPayments,
  setBooking,
  indexPayment
}) => {
  const [refundAmount, setRefundAmount] = useState(0.0);
  const [refundReasons, setRefundReasons] = useState("");
  const [refundId, setRefundId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [updateBookingPaymentRefund] = useMutation(MutationUpdateBookingRefund, {});

  useEffect(() => {
    if (currentPayment) {
      setRefundAmount(currentPayment?.refund?.refundAmount / 100);
      setRefundReasons(currentPayment?.refund?.refundReasons);
      setRefundId(currentPayment?.refund?.refundId);
    }
  }, [currentPayment]);

  const CloseBtn = <X className="cursor-pointer" size={15} onClick={(e) => setShowRefundModal(false)} />;

  const saveRefund = async () => {
    setProcessing(true);

    const newPaymentsArray = payments ? [...payments] : [];

    const refund = {
      refundAmount: refundAmount * 100,
      refundReasons,
      refundId,
      createdAt: new Date()
    };
    const newCurrentPayment = { ...currentPayment, refund };
    delete newCurrentPayment.index;
    newPaymentsArray[indexPayment] = newCurrentPayment;

    try {
      const result = await updateBookingPaymentRefund({
        variables: {
          bookingId: booking._id,
          payments: newPaymentsArray,
          updatedAt: new Date()
        }
      });
      if (result?.data?.updateOneBooking) {
        setPayments(newPaymentsArray);
        setBooking(result?.data?.updateOneBooking);
      }
    } catch (error) {
      console.log("Error saving refund:", error);
    }
    setProcessing(false);
    setShowRefundModal(false);
  };

  return (
    <Modal className="sidebar-sm" contentClassName="pt-0" isOpen={showRefundModal} modalClassName="modal-slide-in">
      <ModalHeader className="mb-3" toggle={(e) => setShowRefundModal(!showRefundModal)} close={CloseBtn} tag="div">
        <h5 className="modal-title">Refund Payment</h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1">
        <FormGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <User size={15} />
              </InputGroupText>
            </InputGroupAddon>
            <Input id="name" placeholder="Full Name*" disabled={mode === "refund"} required={true} value={currentPayment?.name} />
          </InputGroup>
        </FormGroup>

        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                disabled={mode === "refund"}
                min="1"
                step="any"
                placeholder=""
                prefix="$"
                required={true}
                value={currentPayment?.amount / 100}
                className="form-control"
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup>
              <Label for="created">Created At*</Label>
              <InputGroup>
                <Flatpickr
                  value={[currentPayment?.createdAt]}
                  disabled={mode === "refund"}
                  dateformat="Y-m-d H:i"
                  data-enable-time
                  id="signUpDateLine"
                  className="form-control small"
                  placeholder="Select Date..."
                />
              </InputGroup>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label for="refund">Refund Amount*</Label>
              <Input
                id="refund"
                type="number"
                invalid={refundAmount > currentPayment?.amount / 100 || refundAmount < 0}
                min="1"
                step="any"
                placeholder=""
                prefix="$"
                required={true}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="form-control"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <FormGroup>
              <Label for="reason">Reason to refund*</Label>
              <Input
                id="reason"
                type="textarea"
                placeholder=""
                required={true}
                value={refundReasons}
                onChange={(e) => setRefundReasons(e.target.value)}
                className="form-control"
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <FormGroup>
              <Label for="refund-id">Refund ID</Label>
              <Input id="refund-id" placeholder="" value={refundId} onChange={(e) => setRefundId(e.target.value)} />
              <small>ID of the payment platform.</small>
            </FormGroup>
          </Col>
        </Row>
        <Button
          className="mr-1 mt-1"
          color="primary"
          onClick={saveRefund}
          disabled={!refundAmount || !refundReasons || refundAmount > currentPayment?.amount / 100 || refundAmount < 0}
        >
          {processing ? "Saving..." : "Save"}
        </Button>
        <Button className="mt-1" color="secondary" outline onClick={(e) => setShowRefundModal(false)}>
          Cancel
        </Button>
      </ModalBody>
    </Modal>
  );
};

RefundPaymentModal.propTypes = {
  booking: PropTypes.object.isRequired,
  showRefundModal: PropTypes.bool.isRequired,
  setShowRefundModal: PropTypes.func,
  currentPayment: PropTypes.object,
  mode: PropTypes.string,
  payments: PropTypes.array,
  setPayments: PropTypes.func,
  indexPayment: PropTypes.number
};

export default RefundPaymentModal;
