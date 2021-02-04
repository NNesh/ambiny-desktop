import React, { useCallback, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { ScreenResolution } from '../../classes/types';
import { getAspectRatio } from '../../helpers/screen';

export interface PropTypes {
    bsCustomPrefix?: string;
    htmlSize?: number;
    size?: 'sm' | 'lg';
    plaintext?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    value?: ScreenResolution;
    onChange?: (name: string, resolution: ScreenResolution) => void;
    custom?: boolean;
    id?: string;
    isValid?: boolean;
    isInvalid?: boolean;
    options: ScreenResolution[];
    name?: string;
}

function ResolutionField(props: PropTypes) {
    const { onChange, value, options, name, ...restProps } = props;
    const fieldValue = value ? `${value.width}x${value.height}` : null;

    const onChangeValue = useCallback<React.ChangeEventHandler<HTMLSelectElement>>((event) => {
        const idx = event.currentTarget.selectedIndex;
        const resolution = options[idx];
        onChange(name, resolution);
    }, [onChange, name, options]);

    const renderedOptions = useMemo(() => {
        return options.map(option => {
            const value = `${option.width}x${option.height}`;
            const text = `${value} (${getAspectRatio(option)})`;
            return <option key={value} value={value}>{text}</option>;
        });
    }, [options]);

    return (
        <Form.Control
            {...restProps}
            as="select"
            name={name}
            value={fieldValue}
            onChange={onChangeValue}
        >
            {renderedOptions}
        </Form.Control>
    );
}

export default ResolutionField;
