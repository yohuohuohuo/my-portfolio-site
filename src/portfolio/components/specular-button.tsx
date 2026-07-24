'use client';

import Link from 'next/link';
import { useEffect, useRef, type CSSProperties, type MouseEventHandler, type ReactNode, type Ref } from 'react';
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl';

type ButtonSize = 'sm' | 'md' | 'lg';

interface SpecularButtonProps {
  children?: ReactNode;
  href?: string;
  external?: boolean;
  size?: ButtonSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
}

interface ShaderProps {
  radius: number;
  lineColor: string;
  baseColor: string;
  intensity: number;
  shineSize: number;
  shineFade: number;
  thickness: number;
  speed: number;
  followMouse: boolean;
  proximity: number;
  autoAnimate: boolean;
}

const PAD = 20;

const SIZES: Record<ButtonSize, string> = {
  sm: 'text-[14px] px-[11px] py-[9px]',
  md: 'text-[16px] px-[16px] py-[12px]',
  lg: 'text-[18px] px-[20px] py-[14px]',
};

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = sdRoundedRect(p, uHalfSize, uRadius);
  vec2 lightDirection = vec2(cos(uAngle), sin(uAngle));
  vec2 normal = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(normal, lightDirection)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float highlight = line * rim * edgeClamp * uIntensity;
  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;
  vec3 color = uBaseColor * base + uLineColor * highlight;
  fragColor = vec4(color, clamp(base + highlight, 0.0, 1.0));
}
`;

export default function SpecularButton({
  children = 'Get Started',
  href,
  external = false,
  size = 'sm',
  radius = 8,
  tint = '#ffffff',
  tintOpacity = 0,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  ariaLabel,
  onClick,
  className = '',
}: SpecularButtonProps) {
  const elementRef = useRef<HTMLElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const propsRef = useRef<ShaderProps>({} as ShaderProps);

  propsRef.current = { radius, lineColor, baseColor, intensity, shineSize, shineFade, thickness, speed, followMouse, proximity, autoAnimate };

  useEffect(() => {
    const element = elementRef.current;
    const effect = fxRef.current;

    if (!element || !effect) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 1 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: dpr },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    effect.appendChild(gl.canvas);

    const size = { width: 1, height: 1 };
    const resize = () => {
      const rect = element.getBoundingClientRect();
      size.width = rect.width;
      size.height = rect.height;
      renderer.setSize(rect.width + PAD * 2, rect.height + PAD * 2);
      program.uniforms.uCenter.value = [(PAD + rect.width / 2) * dpr, (PAD + rect.height / 2) * dpr];
      program.uniforms.uHalfSize.value = [(rect.width / 2) * dpr, (rect.height / 2) * dpr];
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    resize();

    let pointerAngle: number | null = null;
    let proximityT = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
      const distanceY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
      const distance = Math.hypot(distanceX, distanceY);

      if (distance === 0) {
        const normalizedX = (event.clientX - centerX) / (rect.width / 2);
        const normalizedY = (centerY - event.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + normalizedX * 0.3 + normalizedY * 0.15;
      } else {
        pointerAngle = Math.atan2(centerY - event.clientY, event.clientX - centerX);
      }

      const t = Math.max(0, 1 - distance / Math.max(propsRef.current.proximity, 1));
      proximityT = t * t * (3 - 2 * t);
    };

    window.addEventListener('pointermove', onPointerMove);

    let angle = 2.4;
    let idleAngle = 2.4;
    let brightness = 0;
    let last = performance.now();
    let animationFrame = 0;
    const lineColorValue = new Color();
    const baseColorValue = new Color();

    const update = (now: number) => {
      animationFrame = requestAnimationFrame(update);
      const deltaTime = Math.min((now - last) / 1000, 0.05);
      last = now;
      const props = propsRef.current;

      idleAngle += props.speed * deltaTime;
      const followsPointer = props.followMouse && pointerAngle !== null && (!props.autoAnimate || proximityT > 0);
      const targetAngle = followsPointer && pointerAngle !== null ? pointerAngle : idleAngle;
      const difference = ((targetAngle - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += difference * (1 - Math.exp(-deltaTime * 7));
      const targetBrightness = props.autoAnimate ? 1 : proximityT;
      brightness += (targetBrightness - brightness) * (1 - Math.exp(-deltaTime * 8));

      lineColorValue.set(props.lineColor);
      baseColorValue.set(props.baseColor);
      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value = Math.min(props.radius, Math.min(size.width, size.height) / 2) * dpr;
      program.uniforms.uLineColor.value = [lineColorValue.r, lineColorValue.g, lineColorValue.b];
      program.uniforms.uBaseColor.value = [baseColorValue.r, baseColorValue.g, baseColorValue.b];
      program.uniforms.uIntensity.value = props.intensity * brightness;
      program.uniforms.uShineSize.value = (props.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (props.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = props.thickness * dpr;
      renderer.render({ scene: mesh });
    };

    animationFrame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      if (gl.canvas.parentNode === effect) {
        effect.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  const sharedClassName = `relative m-0 inline-flex cursor-pointer items-center justify-center border-none font-medium leading-none tracking-[0.01em] outline-none transition-transform duration-150 active:scale-[0.97] disabled:cursor-default disabled:opacity-55 disabled:active:scale-100 [color:var(--sb-text-color)] [border-radius:var(--sb-radius)] [background:color-mix(in_srgb,var(--sb-tint)_calc(var(--sb-tint-opacity)*100%),transparent)] [backdrop-filter:blur(var(--sb-blur))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-[3px] ${SIZES[size]}${className ? ` ${className}` : ''}`;
  const sharedStyle = {
    '--sb-radius': `${radius}px`,
    '--sb-tint': tint,
    '--sb-tint-opacity': tintOpacity,
    '--sb-blur': `${blur}px`,
    '--sb-text-color': textColor,
  } as CSSProperties;
  const content = (
    <>
      <span ref={fxRef} aria-hidden="true" className="pointer-events-none absolute -inset-[20px] z-[1] [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full" />
      <span className="relative z-[2]">{children}</span>
    </>
  );

  if (href) {
    const linkProps = {
      'data-specular-button': 'true',
      'aria-label': ariaLabel,
      className: sharedClassName,
      onClick: onClick as MouseEventHandler<HTMLAnchorElement> | undefined,
      ref: elementRef as Ref<HTMLAnchorElement>,
      style: sharedStyle,
    };

    if (external) {
      return (
        <a {...linkProps} href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }

    return (
      <Link {...linkProps} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={elementRef as Ref<HTMLButtonElement>}
      type="button"
      data-specular-button="true"
      aria-label={ariaLabel}
      className={sharedClassName}
      onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
      style={sharedStyle}
    >
      {content}
    </button>
  );
}
