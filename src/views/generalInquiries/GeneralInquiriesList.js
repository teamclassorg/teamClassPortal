// @packages
import moment from 'moment';
import { Col, Spinner } from 'reactstrap';
import { useQuery } from '@apollo/client';
import { useState, useEffect, useContext } from 'react';

// @scripts
import BookingsHeader from '../booking/BookingsHeader/BookingsHeader';
import DataTableGeneralInquiries from './TableGeneralInquiries';
import FiltersModal from '../booking/BoardBookings/FiltersModal';
import queryAllQuestions from '../../graphql/QueryAllQuestions';
import { FiltersContext } from '../../context/FiltersContext/FiltersContext';

const GeneralInquiresList = () => {
  const [filteredGeneralInquiries, setFilteredGeneralInquiries] = useState([]);
  const [generalInquiries, setGeneralInquiries] = useState([]);
  const [generalInquiriesFilter, setGeneralInquiriesFilter] = useState({});
  const [limit, setLimit] = useState(200);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const { textFilterContext, dateFilterContext } = useContext(FiltersContext);

  const { ...allQuestions } = useQuery(queryAllQuestions, {
    fetchPolicy: 'no-cache',
    variables: {
      filter: generalInquiriesFilter,
      limit
    },
    pollInterval: 300000
  });

  useEffect(() => {
    if (allQuestions.data) {
      setGeneralInquiries(allQuestions.data.questions);
    }
  }, [allQuestions.data]);

  const handleSearch = (value) => {
    if (value.length) {
      const updatedData = generalInquiries.filter((item) => {
        const startsWith =
          (item.name && item.name.toLowerCase().startsWith(value.toLowerCase())) ||
          (item.email && item.email.toLowerCase().startsWith(value.toLowerCase()));

        const includes =
          (item.name && item.name.toLowerCase().includes(value.toLowerCase())) ||
          (item.email && item.email.toLowerCase().includes(value.toLowerCase()));

        return startsWith || includes;
      });

      setFilteredGeneralInquiries(updatedData);
    } else {
      setFilteredGeneralInquiries(generalInquiries);
    }
  };

  useEffect(() => {
    let query = {};

    if (dateFilterContext) {
      query = {
        ...query,
        date_gte: moment(dateFilterContext.value[0]).format(),
        date_lte: moment(dateFilterContext.value[1]).add(23, 'hours').add(59, 'minutes').format()
      };
    }

    setGeneralInquiriesFilter(query);
  }, [dateFilterContext]);

  useEffect(() => {
    handleSearch((textFilterContext && textFilterContext.value) || '');
  }, [textFilterContext]);

  useEffect(() => {
    handleSearch((textFilterContext && textFilterContext.value) || '');
  }, [generalInquiries]);

  return (
    <>
      <BookingsHeader
        setShowFiltersModal={(val) => setShowFiltersModal(val)}
        onChangeLimit={(newLimit) => {
          setLimit(newLimit);
        }}
        generalInquiries={filteredGeneralInquiries}
        defaultLimit={limit}
        showLimit={true}
        showExport={true}
        showAdd={false}
        showFilter={true}
        showView={false}
        isGeneralInquiries={true}
        titleView={'General Inquiries '}
      />
      {allQuestions.loading ? (
        <div>
          <Spinner className="mr-25" />
          <Spinner type="grow" />
        </div>
      ) : (
        <>
          <Col sm="12">
            {generalInquiries && generalInquiries.length > 0 && <DataTableGeneralInquiries filteredData={filteredGeneralInquiries} />}
          </Col>
          <FiltersModal
            open={showFiltersModal}
            handleModal={() => setShowFiltersModal(!showFiltersModal)}
            isFilterByClass={false}
            isFilterByCoordinator={false}
            isFilterByCreationDate={true}
          />
        </>
      )}
    </>
  );
};

export default GeneralInquiresList;
