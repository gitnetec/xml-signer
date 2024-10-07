"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Switch } from "@/components/ui/switch";
import { signXml, getDownloadUrl } from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { FaFileDownload } from 'react-icons/fa';

export default function Home() {
  const [pfxFile, setPfxFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [xmlText, setXmlText] = useState("");
  const [hasPassword, setHasPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [signResult, setSignResult] = useState<{
    base64GzipXml: string;
    signedXmlPath: string;
  } | null>(null);

  const handlePfxUpload = (file: File | null) => {
    setPfxFile(file);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pfxFile || !xmlText) {
      toast.error("Please provide both PFX file and XML text");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signXml(pfxFile, passphrase, xmlText);
      console.log("Received result from backend:", result);
      setSignResult(result);
      toast.success("XML signed successfully");
    } catch (error) {
      console.error("Error details:", error);
      toast.error("Error signing XML: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBase64 = () => {
    if (signResult) {
      navigator.clipboard.writeText(signResult.base64GzipXml);
      toast.success("Base64 copied to clipboard");
    }
  };

  const handleDownloadXml = () => {
    if (signResult) {
      window.open(getDownloadUrl(signResult.signedXmlPath), "_blank");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-neutral-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <BackgroundBeams />
      </div>
      <Card className="relative z-10 w-full max-w-md bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            XML Signature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <FileUpload
              onChange={handlePfxUpload}
              accept=".pfx,application/x-pkcs12"
              label="Upload PFX File"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  PFX File Password
                </Label>
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="password-switch"
                    className="text-white text-sm"
                  >
                    {hasPassword ? "Password required" : "No password"}
                  </Label>
                  <Switch
                    id="password-switch"
                    checked={hasPassword}
                    onCheckedChange={setHasPassword}
                  />
                </div>
              </div>
              <AnimatePresence>
                {hasPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      id="password"
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 text-white"
                      placeholder="Enter password"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-2">
              <Label htmlFor="xml-text" className="text-white">
                XML to be signed
              </Label>
              <Textarea
                id="xml-text"
                value={xmlText}
                onChange={(e) => setXmlText(e.target.value)}
                placeholder="Paste your XML here"
                rows={6}
                className="bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 text-white"
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full">
              <HoverBorderGradient
                as="div"
                className="w-full h-12 bg-[linear-gradient(110deg,#09090b,45%,#18181b,55%,#09090b)] text-zinc-400 font-medium flex items-center justify-center"
                containerClassName="w-full rounded-md"
                duration={2}
              >
                <span className="text-sm group-hover:text-yellow-400 transition-all duration-300 ease-in-out">
                  {isLoading ? "Signing..." : "Sign XML"}
                </span>
              </HoverBorderGradient>
            </button>
          </form>

          {signResult && (
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-white">Base64 Gzip XML:</Label>
                <div className="flex space-x-2">
                  <Input
                    value={signResult.base64GzipXml}
                    readOnly
                    className="bg-white/5 backdrop-filter backdrop-blur-sm border border-white/10 text-white"
                  />
                  <Button
                    onClick={handleCopyBase64}
                    className="bg-yellow-500 text-white"
                  >
                    Copy Base64
                  </Button>
                </div>
              </div>
              <div>
                <Button
                  onClick={handleDownloadXml}
                  className="bg-green-500 text-white flex items-center space-x-2"
                >
                  <FaFileDownload /> {/* Ícone de XML */}
                  <span>Download Signed XML</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
