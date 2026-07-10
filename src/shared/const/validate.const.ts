import { isEmpty } from '../utils';

export function isRequired(value: string | boolean | any[]) {
  let result;
  switch (typeof value) {
    case 'string':
      result = value.length > 0;
      break;
    case 'boolean':
      result = true;
      break;
    case 'object':
      if (value instanceof Array) {
        result = value.length > 0;
      } else {
        result = true;
      }
      break;
    default:
      result = false;
  }
  return result;
}

export function isAddress(value: string) {
  return /^0x[0-9a-fA-F]{40}$/g.test(value);
}

export function isLength5(value: string) {
  return /^\S{5}$/.test(value);
}

export function isLength6(value: string) {
  return /^\S{6}$/.test(value);
}

export function isPassword(value: string) {
  return /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*]{6,18}$/.test(value);
}

export function isEmail(value: string) {
  return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
    value
  );
}

export function isEmptyOrHttps(value: string) {
  return isEmpty(value) || isHttps(value);
}

export function isIPFSUri(value: string) {
  return isHttps(value) && value.endsWith('/');
}

export function isHttps(value: string) {
  return new RegExp(
    `https://[-a-zA-Z0-9@:%.\\+~#?&//=]{1,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%.\\+~#?&//=]*)`,
    'gim'
  ).test(value);
}

export function isIPFSPrefix(value: string) {
  return /^https:\/\/.*\/$/.test(value);
}

export function isRepeat(value: string, formData: any) {
  const password = formData.qk_password;
  return value === password;
}

export function initFormValue(formData: any) {
  let obj: any = {};
  for (const key in formData) {
    obj[key] = formData[key][0];
  }
  return obj;
}

export function initFormValidate(formData: any, fn?: (errors: any) => void) {
  const validateMessage = {
    [isRequired.toString()]: 'Validate.required',
    [isAddress.toString()]: 'Validate.isCosting',
    [isLength5.toString()]: 'Validate.isFill',
    [isLength6.toString()]: 'Validate.isFill',
    [isPassword.toString()]: 'Validate.isPassword',
    [isEmail.toString()]: 'Validate.email.invalid',
    [isRepeat.toString()]: 'Validate.isRepeat',
    [isIPFSPrefix.toString()]: 'Validate.isIPFSPrefix',
    [isHttps.toString()]: 'Validate.isHttps',
  };
  return (values: any) => {
    const errors: any = {};
    for (const key in formData) {
      const validateArr = formData[key][1];
      if (validateArr instanceof Array) {
        validateArr.forEach((fn) => {
          if (!fn(values[key], values)) {
            errors[key] = validateMessage[fn.toString()];
          }
        });
      }
    }
    fn && fn(errors);
    return errors;
  };
}
