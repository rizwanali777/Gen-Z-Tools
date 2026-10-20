import type { Metadata } from "next";
import Link from "next/link";
import {
  IMGLY_LICENSE,
  IMGLY_PACKAGE,
  IMGLY_SOURCE,
  IMGLY_VERSION,
  ISNET_SOURCE,
  ONNX_SOURCE,
  SITE_SOURCE,
} from "@/lib/background-removal";

export const metadata: Metadata = {
  title: "Licenses",
  description: "Source and license notices for the in-browser background removal model and the rest of Gen Z Tools.",
};

export default function LicensesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Licenses</h1>
      <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
        <p>
          Remove Background runs {IMGLY_PACKAGE} {IMGLY_VERSION}, copyright IMG.LY GmbH, under the GNU Affero General
          Public License version 3.0. The copy in this site is unmodified. Its corresponding source is{" "}
          <a className="underline decoration-border underline-offset-2 hover:text-foreground" href={IMGLY_SOURCE}>
            {IMGLY_SOURCE}
          </a>
          . The license text is{" "}
          <a className="underline decoration-border underline-offset-2 hover:text-foreground" href={IMGLY_LICENSE}>
            {IMGLY_LICENSE}
          </a>
          . This website&apos;s corresponding source is{" "}
          <a className="underline decoration-border underline-offset-2 hover:text-foreground" href={SITE_SOURCE}>
            {SITE_SOURCE}
          </a>
          .
        </p>
        <p>
          The bundled segmentation model is ISNet from the DIS project, under the MIT license, at{" "}
          <a className="underline decoration-border underline-offset-2 hover:text-foreground" href={ISNET_SOURCE}>
            {ISNET_SOURCE}
          </a>
          . The runtime is onnxruntime-web, also MIT, at{" "}
          <a className="underline decoration-border underline-offset-2 hover:text-foreground" href={ONNX_SOURCE}>
            {ONNX_SOURCE}
          </a>
          . The package also includes lodash-es, ndarray, and zod, each under the MIT license. Those MIT notices stay
          with those components.
        </p>
        <h2 className="pt-2 text-lg font-semibold text-foreground">What you still need to do</h2>
        <p>
          Keep these copyright and license notices with the tool. AGPL-3.0 is a strong copyleft license. Offering this
          library to people who use the site means the corresponding source of the combined work has to stay available
          under AGPL-3.0. The GitHub repository linked above is that offer for this deployment. A closed-source build,
          or a deployment that removes the source link, would not meet that obligation.
        </p>
        <p>
          This deployment does not modify {IMGLY_PACKAGE}. If you change that library, AGPL section 13 requires the
          modified program to offer its corresponding source, at no charge, to everyone who uses it over a network.
          Those changes stay under AGPL-3.0. A commercial license that avoids the copyleft terms is not included.
          IMG.LY handles other licensing at support@img.ly.
        </p>
        <p>
          The MIT model and libraries require their own copyright and permission notices to be retained. They do not
          relicense the rest of the site under MIT, and they do not replace the AGPL terms that apply to{" "}
          {IMGLY_PACKAGE}.
        </p>
        <p>
          <Link className="underline decoration-border underline-offset-2 hover:text-foreground" href="/image-media/remove-background">
            Back to Remove Background
          </Link>
        </p>
      </div>
    </article>
  );
}
