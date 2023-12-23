import { InputProps } from 'antd/lib/input';
import { InputMask, MaskProps, useMask } from '@react-input/mask';
import exp from 'constants';
import { Ref, forwardRef, useContext } from 'react';
import { Input } from 'antd';
import { ConfigContext } from 'antd/es/config-provider';

interface MaskedInputProps extends InputProps {
    mask: MaskProps["mask"];
    replacement: MaskProps["replacement"];
}

export const AntMaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>((props, ref) => {
    

    return <InputMask 

        mask={props.mask}
        replacement={props.replacement}
        className="ant-input"
        style={{
            width: '98%',
            lineHeight: 2,
            borderRadius: 6,
            border: '1px solid #d9d9d9',
                padding: 4,
                paddingLeft: 8
        }}
        ref={ref}
        autoFocus={props.autoFocus}
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange} 
   
        />;
});

// export function MaskedInput(props: Exclude<MaskedInputProps, 'component'>) {
//     return <InputMask component={MaskedInputComponent} {...props} />;
// }