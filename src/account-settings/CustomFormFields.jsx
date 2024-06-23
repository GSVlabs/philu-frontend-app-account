import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, Icon } from '@edx/paragon';
import { ExpandMore } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import messages from './AccountSettingsPage.messages';

const CustomFormFields = ({
  isOrgRegisteredOptions,
  orgTypeOptions,
  totalEmployeesOptions,
  totalEmployees,
  orgType,
  isOrgRegistered,
  onHandleChange,
}) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <span id="orgType">
        <Form.Group controlId="orgType">
          <Form.Label isInline>
            {formatMessage(messages['account.settings.section.type.organization.label'])}
          </Form.Label>
          <Form.Control
            className="org-type"
            as="select"
            name="orgType"
            value={orgType}
            onChange={(e) => onHandleChange(e)}
          >
            <option key="default" value="">
              {formatMessage(messages['account.settings.section.type.organization.select'])}
            </option>
            {orgTypeOptions.map(option => (
              <option className="data-hj-suppress" key={option[0]} value={option[0]}>{option[1]}</option>
            ))}
          </Form.Control>
        </Form.Group>
      </span>
      <span id="isOrgRegistered">
        <Form.Group controlId="isOrgRegistered">
          <Form.Label isInline>
            {formatMessage(messages['account.settings.section.organization.registration.label'])}
            <div className="account-tooltip-icon custom-fields-tooltip-icon">
              i
              <div className="account-tooltip">
                <p>{formatMessage(messages['account.settings.section.organization.registration.tooltip'])}</p>
              </div>
            </div>
          </Form.Label>
          <Form.Control
            className="is-org-registered"
            as="select"
            name="isOrgRegistered"
            value={isOrgRegistered}
            onChange={(e) => onHandleChange(e)}
          >
            <option key="default" value="">
              {formatMessage(messages['account.settings.section.organization.registration.select'])}
            </option>
            {isOrgRegisteredOptions.map(option => (
              <option className="data-hj-suppress" key={option[0]} value={option[0]}>{option[1]}</option>
            ))}
          </Form.Control>
        </Form.Group>
      </span>
      <span id="totalEmployees">
        <Form.Group controlId="totalEmployees">
          <Form.Label isInline>
            {formatMessage(messages['account.settings.section.number.employees.label'])}
          </Form.Label>
          <Form.Control
            className="total-employees"
            as="select"
            name="totalEmployees"
            value={totalEmployees}
            onChange={(e) => onHandleChange(e)}
          >
            <option key="default" value="">
              {formatMessage(messages['account.settings.section.number.employees.select'])}
            </option>
            {totalEmployeesOptions.map(option => (
              <option className="data-hj-suppress" key={option[0]} value={option[0]}>{option[1]}</option>
            ))}
          </Form.Control>
        </Form.Group>
      </span>
    </>
  );
};

CustomFormFields.propTypes = {
  totalEmployeesOptions: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.string,
    ),
  ).isRequired,
  orgTypeOptions: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.string,
    ),
  ).isRequired,
  isOrgRegisteredOptions: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.string,
    ),
  ).isRequired,
  totalEmployees: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  orgType: PropTypes.string,
  isOrgRegistered: PropTypes.string,
  onHandleChange: PropTypes.func.isRequired,
};

CustomFormFields.defaultProps = {
  totalEmployees: undefined,
  orgType: undefined,
  isOrgRegistered: undefined,
};

export default CustomFormFields;
