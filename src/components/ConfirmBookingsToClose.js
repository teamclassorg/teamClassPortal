// @packages
import PropTypes from "prop-types";
import { useState } from "react";
import {
  Alert,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";

// @scripts
import { closeBookingsWithReason } from "../services/BookingService";

const ConfirmBookingsToClose = ({toggle, closedReason, selectedBookingsIds, onEditCompleted, setSelected }) => {
  const [closingBookingsInProcess, setClosingBookingsInProcess] = useState(false);
  const [isCatchError, setIsCatchError] = useState(false);

  const updateClosedStatus = async () => {

    try {
      setClosingBookingsInProcess(true);
      await closeBookingsWithReason(selectedBookingsIds, closedReason);
      onEditCompleted(selectedBookingsIds[0]);
      setSelected({});
      toggle();
      closingBookingsInProcess(false);
    } catch {
      setIsCatchError(true);
      setClosingBookingsInProcess(false);
    }
  };

  return (
    <>
      <ModalHeader>
        Confirmation
      </ModalHeader>
      <ModalBody className="py-3">
        <p className="text-center">Are you sure to close {selectedBookingsIds.length} selected bookings with reason</p>
        <h5 className="text-center font-weight-bold">{closedReason}?</h5>
      </ModalBody>
      <ModalFooter>
        <Button
          className="float-right text-align-center ml-1"
          color="light"
          onClick={toggle}
        >
          Cancel
        </Button>
        <Button
          className="float-right text-align-center ml-1"
          color="primary"
          onClick={updateClosedStatus}
          disabled={closingBookingsInProcess || isCatchError}
        >
          { closingBookingsInProcess ? "Processing..." : "Confirm" }
        </Button>
      </ModalFooter>
      {isCatchError && (
        <Alert color='danger text-center'>
          <div className='alert-body'>
            Something went wrong, please try again.
          </div>
        </Alert>
      )}
    </>
  );
};

ConfirmBookingsToClose.propTypes = {
  toggle: PropTypes.func.isRequired,
  closedReason: PropTypes.string.isRequired,
  selectedBookingsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onEditCompleted: PropTypes.func.isRequired,
  setSelected: PropTypes.func.isRequired
};

export default ConfirmBookingsToClose;
