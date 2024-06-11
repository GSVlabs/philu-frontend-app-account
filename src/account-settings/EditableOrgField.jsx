import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { injectIntl, useIntl, intlShape } from '@edx/frontend-platform/i18n';
import { snakeCaseObject } from '@edx/frontend-platform/utils';
import {
  Button, Form, StatefulButton,
} from '@edx/paragon';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import OrganizationFormField from './OrganizationFormField';
import SwitchContent from './SwitchContent';
import messages from './AccountSettingsPage.messages';
import { getOrganization } from './data/service';

import {
  openForm,
  closeForm,
} from './data/actions';
import { editableFieldSelector } from './data/selectors';
import CertificatePreference from './certificate-preference/CertificatePreference';

const EditableField = (props) => {
  const {
    name,
    label,
    value,
    emptyLabel,
    type,
    organizationData,
    customFields,
    userSuppliedValue,
    saveState,
    error,
    confirmationMessageDefinition,
    confirmationValue,
    helpText,
    helpMainText,
    onEdit,
    onChange,
    onCancel,
    onSubmit,
    isEditing,
    isEditable,
    isGrayedOut,
    intl,
    ...others
  } = props;
  const id = `field-${name}`;

  const { formatMessage } = useIntl();
  const [orgLabel, setOrgLabel] = useState('');
  const [orgId, setOrgId] = useState('');
  const [isOrgRegistered, setIsOrgRegistered] = useState('');
  const [orgType, setOrgType] = useState('');
  const [totalEmployees, setTotalEmployees] = useState('');
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [showCustomFormFields, setShowCustomFormFields] = useState(false);
  const [formErrors, setFormErrors] = useState(null);

  useEffect(() => {
    if (value?.label) {
      setOrgLabel(value.label);
      setOrgId(value?.id);
      setIsOrgRegistered(value?.is_org_registered);
      setOrgType(value?.org_type);
      setTotalEmployees(value?.total_employees);
      setShowCustomFormFields(true);
      setFormErrors(null);
    }
  }, [value]);

  const handleEdit = () => {
    if (value?.label) {
      setShowCustomFormFields(true);
    }
    onEdit(name);
  };

  const handleCancel = () => {
    setOrgLabel(value?.label);
    setOrgId(value?.id);
    setIsOrgRegistered(value?.is_org_registered);
    setOrgType(value?.org_type);
    setTotalEmployees(value?.total_employees);
    setFormErrors(null);
    setShowCustomFormFields(false);
    onCancel(name);
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    let changedOrgData = {
      orgLabel,
      orgId,
      isOrgRegistered,
      orgType,
      totalEmployees,
    };

    switch (event.target.name) {
      case 'orgLabel':
        setOrgLabel(newValue);
        setOrgId();
        setIsOrgRegistered();
        setOrgType();
        setTotalEmployees();
        changedOrgData = {
          orgLabel: newValue,
        };
        break;
      case 'orgId':
        setOrgId(newValue);
        changedOrgData.orgId = newValue;
        break;
      case 'isOrgRegistered':
        setIsOrgRegistered(newValue);
        changedOrgData.isOrgRegistered = newValue;
        break;
      case 'orgType':
        setOrgType(newValue);
        changedOrgData.orgType = newValue;
        break;
      case 'totalEmployees':
        setTotalEmployees(newValue);
        changedOrgData.totalEmployees = newValue;
        break;
      default:
        break;
    }
    onChange(name, changedOrgData);
  };

  const renderEmptyLabel = () => {
    if (isEditable) {
      return <Button variant="link" onClick={handleEdit} className="p-0">{emptyLabel}</Button>;
    }
    return <span className="text-muted">{emptyLabel}</span>;
  };

  const renderValue = (rawValue) => {
    if (!rawValue) {
      return renderEmptyLabel();
    }
    let finalValue = rawValue;

    if (userSuppliedValue) {
      finalValue += `: ${userSuppliedValue}`;
    }

    return finalValue;
  };

  const renderConfirmationMessage = () => {
    if (!confirmationMessageDefinition || !confirmationValue) {
      return null;
    }
    return intl.formatMessage(confirmationMessageDefinition, {
      value: confirmationValue,
    });
  };

  const clearAllFields = () => {
    setOrgLabel();
    setOrgId();
    setIsOrgRegistered();
    setOrgType();
    setTotalEmployees();
    setOptions([]);
    setFormErrors(null);
  };

  const organizationSelectHandler = async (selectedOption) => {
    if (!selectedOption) {
      clearAllFields();
      setShowCustomFormFields(false);
      return;
    }

    setOptions([]);
    const results = await getOrganization(selectedOption.value);
    setOrgLabel(results.organization_label);
    setOrgId(results.organization_id);
    setIsOrgRegistered(results.is_organization_registered);
    setOrgType(results.organization_type);
    setTotalEmployees(results.organization_size);
    handleChange({ target: { name: 'organization', value: results.organization_label } });
    handleChange({ target: { name: 'orgId', value: results.organization_id } });
    handleChange({ target: { name: 'isOrgRegistered', value: results.is_organization_registered } });
    handleChange({ target: { name: 'orgType', value: results.organization_type } });
    handleChange({ target: { name: 'totalEmployees', value: results.organization_size } });
  };

  const castomFieldsSelectHandler = (event) => {
    switch (event.target.name) {
      case 'orgType':
        setOrgType(event.target.value);
        break;
      case 'isOrgRegistered':
        setIsOrgRegistered(event.target.value);
        break;
      case 'totalEmployees':
        setTotalEmployees(event.target.value);
        break;
      default:
        break;
    }
  };

  const validateOrganizationName = (orgName) => {
    const updatedName = orgName?.trim().toLowerCase();
    const errors = {};
    if (updatedName?.length < 2 || updatedName?.length > 255) {
      errors.name = formatMessage(messages['account.settings.section.organization.name.length.error']);
    }
    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setOptionsMenuOpen(false);
    if (orgLabel) {
      const orgNameErrors = validateOrganizationName(orgLabel);
      if (Object.keys(orgNameErrors).length > 0) {
        setFormErrors(orgNameErrors);
        return;
      }
    }
    const changedOrgData = snakeCaseObject({
      orgLabel,
      orgId,
      isOrgRegistered,
      orgType,
      totalEmployees,
    });
    onSubmit(name, changedOrgData || null);
  };

  return (
    <SwitchContent
      expression={isEditing ? 'editing' : 'default'}
      cases={{
        editing: (
          <>
            <form onSubmit={handleSubmit}>
              <Form.Group
                controlId={id}
                isInvalid={error != null}
              >
                <Form.Label size="sm" className="h6 d-block" htmlFor={id}>{label}</Form.Label>
                <OrganizationFormField
                  orgLabel={orgLabel}
                  orgId={orgId}
                  isOrgRegistered={isOrgRegistered}
                  orgType={orgType}
                  totalEmployees={totalEmployees}
                  customFieldsData={customFields}
                  setOptions={setOptions}
                  options={options}
                  formErrors={formErrors}
                  setFormErrors={setFormErrors}
                  onHandleChange={handleChange}
                  showCustomFormFields={showCustomFormFields}
                  setShowCustomFormFields={setShowCustomFormFields}
                  onSelecteOrganizationHandler={organizationSelectHandler}
                  onCastomFieldsSelectHandler={castomFieldsSelectHandler}
                  optionsMenuOpen={optionsMenuOpen}
                  setOptionsMenuOpen={setOptionsMenuOpen}
                  helpText={helpText}
                />
                {!!helpMainText && <Form.Text>{helpMainText}</Form.Text>}
                {error != null && <Form.Control.Feedback hasIcon={false}>{error}</Form.Control.Feedback>}
                {others.children}
              </Form.Group>
              <p>
                <StatefulButton
                  type="submit"
                  className="mr-2"
                  state={saveState}
                  labels={{
                    default: intl.formatMessage(messages['account.settings.editable.field.action.save']),
                  }}
                  onClick={(e) => {
                    // Swallow clicks if the state is pending.
                    // We do this instead of disabling the button to prevent
                    // it from losing focus (disabled elements cannot have focus).
                    // Disabling it would causes upstream issues in focus management.
                    // Swallowing the onSubmit event on the form would be better, but
                    // we would have to add that logic for every field given our
                    // current structure of the application.
                    if (saveState === 'pending') { e.preventDefault(); }
                  }}
                  disabledStates={[]}
                />
                <Button
                  variant="outline-primary"
                  onClick={handleCancel}
                >
                  {intl.formatMessage(messages['account.settings.editable.field.action.cancel'])}
                </Button>
              </p>
            </form>
            {['name', 'verified_name'].includes(name) && <CertificatePreference fieldName={name} />}
          </>
        ),
        default: (
          <div className="form-group">
            <div className="d-flex align-items-start">
              <h6 aria-level="3">{label}</h6>
              {isEditable ? (
                <Button variant="link" onClick={handleEdit} className="ml-3">
                  <FontAwesomeIcon className="mr-1" icon={faPencilAlt} />{intl.formatMessage(messages['account.settings.editable.field.action.edit'])}
                </Button>
              ) : null}
            </div>
            <p data-hj-suppress className={classNames('text-truncate', { 'grayed-out': isGrayedOut })}>{renderValue(value?.label)}</p>
            <p className="small text-muted mt-n2">{renderConfirmationMessage() || helpMainText}</p>
          </div>
        ),
      }}
    />
  );
};

EditableField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  emptyLabel: PropTypes.node,
  type: PropTypes.string.isRequired,
  userSuppliedValue: PropTypes.string,
  saveState: PropTypes.oneOf(['default', 'pending', 'complete', 'error']),
  error: PropTypes.string,
  confirmationMessageDefinition: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  organizationData: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_employees: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    is_org_registered: PropTypes.string,
    org_type: PropTypes.string,
  }),
  customFields: PropTypes.shape({
    total_employee_options: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.string,
      ),
    ),
    org_type_options: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.string,
      ),
    ),
    is_org_registered_options: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.string,
      ),
    ),
  }).isRequired,
  confirmationValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  helpText: PropTypes.node,
  helpMainText: PropTypes.node,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isEditable: PropTypes.bool,
  isGrayedOut: PropTypes.bool,
  intl: intlShape.isRequired,
};

EditableField.defaultProps = {
  saveState: undefined,
  label: undefined,
  value: undefined,
  emptyLabel: undefined,
  error: undefined,
  organizationData: undefined,
  confirmationMessageDefinition: undefined,
  confirmationValue: undefined,
  helpText: undefined,
  helpMainText: undefined,
  isEditing: false,
  isEditable: true,
  isGrayedOut: false,
  userSuppliedValue: undefined,
};

export default connect(editableFieldSelector, {
  onEdit: openForm,
  onCancel: closeForm,
})(injectIntl(EditableField));
