import { InputProps } from 'antd/lib/input';
import { InputMask, MaskProps } from '@react-input/mask';
import { forwardRef, KeyboardEvent } from 'react';

interface MaskedInputProps extends InputProps {
    mask: MaskProps["mask"];
    replacement: MaskProps["replacement"];
}

export const AntMaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>((props, ref) => {


    return <span className="ant-input-affix-wrapper ant-input-outlined" 
        style={{
                borderRadius: 6,
                border: '1px solid #d9d9d9',
                padding: 4,
                paddingLeft: 10,
                width: 'calc(100% - 16px)',
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
                alignItems: 'center',
                alignContent: 'space-between'
            }}>
        <InputMask 
            mask={props.mask}
            replacement={props.replacement}
            style={{
                border: 'none',
                lineHeight: 2,
                flexGrow: 2
            }}
            className="ant-input"
            onKeyDown={props.onKeyDown}
            ref={ref}
            autoFocus={props.autoFocus}
            placeholder={props.placeholder}
            value={props.value as number}
            onChange={props.onChange} 

        />
        <span style={{
            color: 'darkgray'
        }}>
            {props.value?.toString().length}/{props.mask?.length}
        </span>
    </span>
});

export function focusNext(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
        const target: HTMLInputElement  = e.currentTarget;
        const form = target.form
        if (form == null) return false;
        const inputs = Array.from(form.getElementsByTagName('input'));
        const idx = inputs.indexOf(target);
        if (idx === -1) {
            console.log("Element not found in the array, maybe it's not and input", target);
            return false;
        }
        if (idx + 1 < inputs.length) {
            inputs[idx + 1].focus();
            return true;
        }
    }
    return false

};
