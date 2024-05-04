import "./Loading.scss";

/**
 * Loading component
 *
 * The Loading component is an atom that displays a spinner while the content is loading.
 * @component
 * @returns {JSX.Element} The Loading component
 */
export default function Loading(): JSX.Element {
  return <div className="loader" />;
}
