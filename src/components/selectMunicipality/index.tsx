import styles from './styles.module.scss';

import { useCombobox } from 'downshift';
import { useState, Dispatch, SetStateAction } from 'react';

import siteText from 'locale';

import { SafetyRegion, MunicipalityMapping, RegionType } from 'pages/regio';
import Arrow from 'assets/white-arrow.svg';
import ResetIcon from 'assets/reset.svg';

import ScreenReaderOnly from 'components/screenReaderOnly';
import replaceVariablesInText from 'utils/replaceVariablesInText';
import SelectSafetyRegionValue from './select-safety-region-value';
import SelectMunicipalityValue from './select-municipality-value';

type SelectMunicipalityProps = {
  regionType: RegionType;
  municipalities: MunicipalityMapping[];
  safetyRegions: SafetyRegion[];
  setSelectedSafetyRegion: (selection: MunicipalityMapping) => void;
  setSelectedMunicipality: (selection: MunicipalityMapping) => void;
  textInput: string;
  setTextInput: Dispatch<SetStateAction<string>>;
};

// Returns the string to display as an item's label.
export const itemToString = (item?: MunicipalityMapping): string =>
  item ? item.name : '';

const SelectMunicipality: React.FC<SelectMunicipalityProps> = (props): any => {
  const {
    regionType,
    municipalities,
    safetyRegions,
    setSelectedSafetyRegion,
    setSelectedMunicipality,
    textInput,
    setTextInput,
  } = props;

  const text: typeof siteText.select_municipality =
    siteText.select_municipality;

  // Set the full list of municipalities as the initial state.
  const [items, setItems] = useState(() => municipalities);

  // Returns municipalities by safety region and current inputValue, sorted alphabetically.
  const getRegionItems = (safetyRegion: string, inputValue: string) => {
    return items
      .filter((el) => el.safetyRegion === safetyRegion)
      .filter((el) => !getDisabled(el, inputValue))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const getMunicipalities = (inputValue: string) => {
    return items
      .filter((el) => !getDisabled(el, inputValue))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Returns true if a municipality should be disabled based on the current input value.
  const getDisabled = (item: MunicipalityMapping, inputValue: string) => {
    if (!inputValue) return false;
    return !item.name.toLowerCase().startsWith(inputValue.toLowerCase());
  };

  // Returns true if a safety region should be hidden.
  const getRegionDisabled = (
    items: MunicipalityMapping[],
    inputValue: string
  ) => {
    return items.every((item) => getDisabled(item, inputValue));
  };

  // Select the current content of the input
  const selectInputContent = () => {
    // The DOM is used here instead of a ref because Downshift overwrites any ref
    // used on the input element.
    const input: HTMLInputElement | null = document.querySelector(
      '#select-municipality-input'
    );

    input && input.select();
  };

  // Set the safety region code to the URL on item selection
  const onSelectedItemChange = ({ selectedItem }: any) => {
    if (regionType === 'safetyRegion') {
      setSelectedSafetyRegion(selectedItem);
    } else {
      setSelectedMunicipality(selectedItem);
    }
  };

  // Filters municipalities when the input changes
  const onInputValueChange: any = ({ inputValue }: { inputValue: string }) => {
    setTextInput(inputValue);
    setItemsForTextInput();
  };

  const setItemsForTextInput = (): void => {
    setItems(municipalities.filter((item) => !getDisabled(item, textInput)));
  };

  // Select the current input when the dropdown is opened.
  const onIsOpenChange: any = ({ isOpen }: { isOpen: boolean }) => {
    if (isOpen) {
      setItemsForTextInput();
      selectInputContent();
    }
  };

  // Select the input content and open the menu on focusing the input
  const onFocus = () => {
    selectInputContent();
    openMenu();
  };

  // Returns a string for an aria-live selection status message.
  const getA11ySelectionMessage = ({
    itemToString,
    selectedItem,
  }: {
    itemToString: (item: MunicipalityMapping) => string;
    selectedItem: MunicipalityMapping;
  }) => {
    if (selectedItem) {
      const safetyRegion = safetyRegions.find(
        (el) => el.code === selectedItem.safetyRegion
      );

      return replaceVariablesInText(
        text.municipality_in_safety_region_selected,
        {
          municipality: itemToString(selectedItem),
          safetyRegion: safetyRegion?.name,
        }
      );
    }

    return text.no_municipality_selected;
  };

  // Returns a string for an aria-live status message shown while typing.
  const getA11yStatusMessage: any = ({
    resultCount,
  }: {
    resultCount: string;
  }) => {
    return replaceVariablesInText(text.result_count_help_text, {
      resultCount: String(resultCount),
    });
  };

  // State reducer with an override for the ItemClick action.
  const stateReducer = (_: any, actionAndChanges: any) => {
    const { type, changes } = actionAndChanges;
    switch (type) {
      // overriding the result of this action fixes a race condition bug in IE11
      // where several actions would be triggered after selecting an item in the
      // dropdown menu.
      case useCombobox.stateChangeTypes.ItemClick: {
        return changes;
      }
      default: {
        // Returning changes here, and not state, allows Downshift to handle
        // actions that are not overridden itself.
        return changes;
      }
    }
  };

  const {
    getComboboxProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    inputValue,
    isOpen,
    openMenu,
    reset,
    selectedItem,
  } = useCombobox({
    inputValue: textInput,
    items,
    itemToString,
    stateReducer,
    onSelectedItemChange,
    onInputValueChange,
    onIsOpenChange,
    getA11yStatusMessage,
    getA11ySelectionMessage,
  });

  return (
    <div className={styles.root}>
      <label {...getLabelProps({ className: styles.label })}>
        {text.select_municipality}
      </label>
      <div {...getComboboxProps({ className: styles.combobox })}>
        <input
          {...getInputProps({
            onClick: onFocus,
            id: 'select-municipality-input',
            placeholder: text.input_municipality_placeholder,
          })}
        />
        {selectedItem && (
          <button onClick={reset} className={styles.reset}>
            <ScreenReaderOnly>Reset</ScreenReaderOnly>
            <div aria-hidden="true">
              <ResetIcon />
            </div>
          </button>
        )}
        <button
          {...getToggleButtonProps({
            tabIndex: 0,
            className: styles.open,
            'aria-label': 'open gemeentes',
          })}
        >
          <Arrow aria-hidden="true" />
        </button>
      </div>
      <div
        {...getMenuProps({
          className: styles.menu,
        })}
      >
        {isOpen && regionType === 'safetyRegion' && (
          <SelectSafetyRegionValue
            safetyRegions={safetyRegions}
            inputValue={inputValue}
            highlightedIndex={highlightedIndex}
            getRegionItems={getRegionItems}
            getRegionDisabled={getRegionDisabled}
            getItemProps={getItemProps}
            items={items}
          />
        )}

        {isOpen && regionType === 'municipality' && (
          <SelectMunicipalityValue
            getMunicipalities={getMunicipalities}
            inputValue={inputValue}
            highlightedIndex={highlightedIndex}
            getItemProps={getItemProps}
            items={items}
          />
        )}
      </div>
    </div>
  );
};

export default SelectMunicipality;
