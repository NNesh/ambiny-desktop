import React, { useMemo, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Form,  } from 'react-bootstrap';
import { DesktopCapturerSource } from 'electron';

export interface FormOptions {
    screen?: string,
    ledVertNumber: number,
    ledHorNumber: number,
    vertPadding: number,
    horPadding: number,
};

export interface Props {
    screens?: DesktopCapturerSource[];
    selectedScreenId?: string;
    initialLedVertNumber: number;
    initialLedHorNumber: number;
    initialHorPadding: number,
    initialVertPadding: number,
    onUpdateOptions: (values: FormOptions) => void;
};


export default function ControlPanel({
    screens,
    selectedScreenId,
    initialLedVertNumber = 12,
    initialLedHorNumber = 12,
    initialHorPadding = 0,
    initialVertPadding = 0,
    onUpdateOptions,
}: Props) {
    const screenOptions = useMemo(() => {
        return screens.map(screen => <option key={screen.id} value={screen.id}>{screen.name}</option>)
    }, [screens]);

    const initialValues = useMemo(
        (): FormOptions => ({
            screen: selectedScreenId,
            ledVertNumber: initialLedVertNumber,
            ledHorNumber: initialLedHorNumber,
            vertPadding: initialVertPadding,
            horPadding: initialHorPadding,
        }),
        []
    );

    const validate = useCallback((values: FormOptions) => {
        const errors: any = {};

        if (values.ledHorNumber < 1) {
            errors.ledHorNumber = 'LED count should be positive';
        }

        if (values.ledVertNumber < 1) {
            errors.ledVertNumber = 'LED count should be positive';
        }

        return errors;
    }, []);

    const handleOptionsUpdating = useCallback((values, { setSubmitting, setTouched }: FormikHelpers<any>) => {
        onUpdateOptions(values);
        setSubmitting(false);
        setTouched({
            screen: false,
            ledHorNumber: false,
            ledVertNumber: false,
            horPadding: false,
            vertPadding: false,
        });
    }, [onUpdateOptions]);

    const renderForm = useCallback((options: FormikProps<FormOptions>) => {
        const {
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            dirty,
            // isSubmitting,
        } = options;

        const submitButtonRef = useRef<HTMLButtonElement>();
        const debouncedSubmit = useMemo(() => debounce(() => submitButtonRef.current?.click(), 1500), [submitButtonRef?.current]);

        const customChangeHandler = useCallback((e: React.ChangeEvent<any>) => {
            debouncedSubmit();
            return handleChange(e);
        }, [debouncedSubmit]);

        return (
            <Form noValidate onSubmit={handleSubmit}>
                <h3>Options</h3>
                <Form.Group controlId="formScreen">
                    <Form.Label>Selected screen</Form.Label>
                    <Form.Control
                        name="screen"
                        as="select"
                        value={values.screen}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isValid={!!errors.screen}
                    >
                        {screenOptions}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid" tooltip>
                        {errors.screen}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formLedHorNumber">
                    <Form.Label>LED horizontal number</Form.Label>
                    <Form.Control
                        type="number"
                        name="ledHorNumber"
                        min={0}
                        value={values.ledHorNumber}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.ledHorNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.ledHorNumber}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formLedVertNumber">
                    <Form.Label>LED vertical number</Form.Label>
                    <Form.Control
                        type="number"
                        name="ledVertNumber"
                        min={0}
                        value={values.ledVertNumber}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.ledVertNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.ledVertNumber}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formHorPadding">
                    <Form.Label>LED horizontal padding</Form.Label>
                    <Form.Control
                        type="range"
                        name="horPadding"
                        min={5}
                        max={100}
                        value={values.horPadding}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.horPadding}
                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                        {errors.horPadding}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formVertPadding">
                    <Form.Label>LED vertical padding</Form.Label>
                    <Form.Control
                        type="range"
                        name="vertPadding"
                        min={5}
                        max={100}
                        value={values.vertPadding}
                        onChange={customChangeHandler}
                        onBlur={handleBlur}
                        isInvalid={!!errors.vertPadding}
                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                        {errors.vertPadding}
                    </Form.Control.Feedback>
                </Form.Group>
                <button ref={submitButtonRef} className="hidden" type="submit"></button>
            </Form>
        )
    }, []);

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={handleOptionsUpdating}
            validate={validate}
        >
            {renderForm}
        </Formik>
    );
}