import Link, { LinkProps } from 'next/link'
import { AnchorHTMLAttributes, FC } from 'react'

interface CommonLinkInterface {
  disable?: boolean
}

export const CommonLink: FC<
  AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps & CommonLinkInterface
> = ({ disable, ...props }) => {
  if (disable) {
    return (
      <span className={props.className} style={props.style} {...props}>
        {props.children}
      </span>
    )
  }
  return <Link {...props} />
}
