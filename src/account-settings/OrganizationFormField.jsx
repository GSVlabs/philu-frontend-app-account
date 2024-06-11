import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import PropTypes from 'prop-types';
import { Form } from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';

import CustomFormFields from './CustomFormFields';
import { getOrganizations } from './data/service';
import messages from './AccountSettingsPage.messages';

const OrganizationFormField = (props) => {
  const { formatMessage } = useIntl();
  const currentRequestRef = useRef('');
  const selectRef = useRef(null);

  const {
    orgLabel,
    orgId,
    options,
    isOrgRegistered,
    orgType,
    totalEmployees,
    customFieldsData,
    setOptions,
    formErrors,
    optionsMenuOpen,
    showCustomFormFields,
    setOptionsMenuOpen,
    setShowCustomFormFields,
    setFormErrors,
    onSelecteOrganizationHandler,
    onHandleChange,
    helpText,
  } = props;

  useEffect(() => {
    if (!orgLabel && selectRef.current) {
      selectRef.current.blur();
    }
  }, [orgLabel]);

  const delayedGetOrganizations = useMemo(
    () => debounce((name, callback) => {
      getOrganizations(name).then(results => {
        if (currentRequestRef.current !== name) {
          // If the current request does not match the latest query, do not update the state
          return;
        }
        let transformedResults = Object.keys(results).map(key => {
          const org = results[key];
          return {
            value: org.id,
            nameOrg: org.label,
            label: (
              <span className="organization-dropdown-item">
                {org.label}
                <span>
                  {org.country}
                </span>
              </span>
            ),
          };
        });

        if (transformedResults.length > 0) {
          const informativeOption = {
            value: null,
            nameOrg: null,
            label: <span className="organization-select-info">{formatMessage(messages['account.settings.section.organization.select.info'])}</span>,
            isDisabled: true,
          };
          transformedResults = [informativeOption, ...transformedResults];
        }
        setOptions(transformedResults);
        callback(transformedResults);
      });
    }, 600),
    [formatMessage, setOptions],
  );

  const getOrganizationsCallback = useCallback(
    (...args) => {
      delayedGetOrganizations(...args);
    },
    [delayedGetOrganizations],
  );

  const loadOptions = (inputValue, callback) => {
    const updatedName = inputValue.trim();
    currentRequestRef.current = updatedName;
    if (updatedName?.length > 1) {
      getOrganizationsCallback(updatedName, callback);
      setShowCustomFormFields(true);
      setOptionsMenuOpen(true);
    } else {
      callback([]);
      setShowCustomFormFields(false);
      setOptionsMenuOpen(false);
      setOptions([]);
    }
  };

  const handleInputChange = (newValue, actionMeta) => {
    if (actionMeta.action === 'input-change') {
      setFormErrors(null);
      onHandleChange({ target: { name: 'orgLabel', value: newValue.trim() } });
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      height: 44,
      borderColor: state.isFocused ? '#61b4e4' : '#707070',
      boxShadow: state.isFocused ? '0 0 0 1px #61b4e4' : 'none',
      fontSize: 18,
      '&:hover': {
        borderColor: '#707070',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#454545',
    }),
    menu: (provided) => ({
      ...provided,
      width: 'calc(100% - .5rem)',
    }),
  };

  return (
    <div className="mb-4">
      <AsyncSelect
        ref={selectRef}
        placeholder={formatMessage(messages['account.settings.section.organization.name'])}
        defaultOptions={options}
        isOptionDisabled={(option) => option.isDisabled}
        value={orgLabel ? { label: orgLabel, value: orgId } : null}
        loadOptions={loadOptions}
        onInputChange={handleInputChange}
        onChange={onSelecteOrganizationHandler}
        menuIsOpen={optionsMenuOpen && options?.length > 0}
        onMenuOpen={() => setOptionsMenuOpen(true)}
        onMenuClose={() => setOptionsMenuOpen(false)}
        isClearable
        escapeClearsValue
        className="organization-select"
        styles={customStyles}
      />
      {formErrors?.name && (
        <div className="text-danger mt-2" style={{ fontSize: '0.7em' }}>
          {formErrors?.name}
        </div>
      )}
      <Form.Text>{helpText}</Form.Text>
      {showCustomFormFields && (
        <CustomFormFields
          isOrgRegisteredOptions={customFieldsData.is_org_registered_options}
          orgTypeOptions={customFieldsData.org_type_options}
          totalEmployeesOptions={customFieldsData.total_employee_options}
          totalEmployees={totalEmployees}
          orgType={orgType}
          isOrgRegistered={isOrgRegistered}
          onHandleChange={onHandleChange}
        />
      )}
    </div>
  );
};

OrganizationFormField.propTypes = {
  customFieldsData: PropTypes.shape({
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
  totalEmployees: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  orgType: PropTypes.string,
  isOrgRegistered: PropTypes.string,
  orgLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  orgId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.array,
  formErrors: PropTypes.shape({
    name: PropTypes.string,
  }),
  optionsMenuOpen: PropTypes.bool,
  showCustomFormFields: PropTypes.bool,
  setOptions: PropTypes.func.isRequired,
  setOptionsMenuOpen: PropTypes.func.isRequired,
  setShowCustomFormFields: PropTypes.func.isRequired,
  setFormErrors: PropTypes.func.isRequired,
  onSelecteOrganizationHandler: PropTypes.func.isRequired,
  onHandleChange: PropTypes.func.isRequired,
  helpText: PropTypes.node,
};

OrganizationFormField.defaultProps = {
  orgLabel: undefined,
  orgId: undefined,
  totalEmployees: undefined,
  orgType: undefined,
  isOrgRegistered: undefined,
  options: [],
  formErrors: {},
  optionsMenuOpen: {},
  showCustomFormFields: false,
  helpText: undefined,
};

export default OrganizationFormField;
