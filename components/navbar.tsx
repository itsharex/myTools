"use client"
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  useNavbar
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";

import { SlArrowLeft, SlMagnifier, SlRefresh, SlSettings } from "react-icons/sl";
import { Tab, Tabs } from "@nextui-org/react";
import { usePathname, useRouter } from "next/navigation";
import { invoke } from "@tauri-apps/api/core";
import { AiOutlineAppstore, AiOutlineCloud, AiOutlineEdit, AiOutlineEye, AiOutlineInfoCircle, AiOutlineTool } from "react-icons/ai";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { getCurrent } from "@tauri-apps/api/webviewWindow";


export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    setInterval(()=> {
      document.querySelector("nav header")?.setAttribute("data-tauri-drag-region", "true")
    },1000)
    getCurrent().theme().then(theme => {
      setTheme(theme as string)
    }).catch(e => {
      console.log(e)
    })
    listen(TauriEvent.WINDOW_THEME_CHANGED, (event) => {
      if (typeof event.payload === "string") {
        setTheme(event.payload)
      }
    });
  }, [setTheme])

  const router = useRouter();
  let pathname = usePathname();

  if (pathname.includes("/edittools")) {
    pathname = "/edittools"
  } else if (pathname.includes("/details")) {
    pathname = "/details"
  }
  const backPageList = ["/details"]
  function goBack() {
    router.back();
  }

  function openSettingsWindow() {
    invoke("show_settings").catch(e => {
      console.log(e)
    })
  }
  function SettingButton() {
    if (pathname != "/settings") {
      return (
        <Button onClick={openSettingsWindow} variant="light" size="sm" isIconOnly startContent={<SlSettings />}>
        </Button>
      )
    } else {
      return <></>
    }
  }
  function NavTitle() {
    if (pathname == "/settings") {
      return (
        <span className="font-bold">设置</span>
      )
    } else {
      return <></>
    }
  }

  function NavWarpper({ children }: { children: React.ReactNode }) {
    return <NextUINavbar shouldHideOnScroll={false} height={"52px"} className="bg-default-100" data-tauri-drag-region maxWidth="full">{children}</NextUINavbar>
  }
  function OptionNav() {
    if (pathname.includes("/settings")) {
      return (<NavWarpper>
        <NavbarBrand></NavbarBrand>
        <NavbarContent data-tauri-drag-region className="gap-4" justify="center">
          <Tabs selectedKey={pathname} size="sm" radius="full">
            <Tab key="/settings" title={
              <div className="flex items-center space-x-2">
                <AiOutlineTool />
                <span>工具源</span>
              </div>
            } href="/settings"></Tab>
            <Tab isDisabled key="/settings/appearence" title={
              <div className="flex items-center space-x-2">
                <AiOutlineEye />
                <span>外观</span>
              </div>
            } href="/settings/appearence"></Tab>
            <Tab key="/settings/about" title={
              <div className="flex items-center space-x-2">
                <AiOutlineInfoCircle />
                <span>关于</span>
              </div>
            } href="/settings/about"></Tab>
          </Tabs>
        </NavbarContent>
        <NavbarContent data-tauri-drag-region justify="end">
          <NavbarItem>
          </NavbarItem>
        </NavbarContent>
      </NavWarpper>)
    }
    if (backPageList.includes(pathname)) {
      return (<NavWarpper>
        <NavbarBrand data-tauri-drag-region>
          <Button className="ml-16" onClick={goBack} variant="light" size="sm" isIconOnly startContent={<SlArrowLeft />}></Button>
        </NavbarBrand>
        <NavbarContent data-tauri-drag-region className="gap-4" justify="center">
          <NavTitle />
        </NavbarContent>
        <NavbarContent data-tauri-drag-region justify="end">
          <NavbarItem>
            <SettingButton />
          </NavbarItem>
        </NavbarContent>
      </NavWarpper>
      )
    } else {
      return (<NavWarpper>
        <NavbarBrand data-tauri-drag-region></NavbarBrand>
        <NavbarContent data-tauri-drag-region className="gap-4" justify="center">
          <Tabs size="sm" radius="full" aria-label="Options" selectedKey={pathname}>
            <Tab key="/software" title={<div className="flex items-center space-x-2">
              <AiOutlineAppstore />
              <span>App</span>
            </div>} href="/software" />
            <Tab key="/website" title={<div className="flex items-center space-x-2">
              <AiOutlineCloud />
              <span>网站</span>
            </div>} href="/website" />
            <Tab key="/edittools" title={<div className="flex items-center space-x-2">
              <AiOutlineEdit />
              <span>编辑</span>
            </div>} href="/edittools/edit" />
            <Tab key="/search" title={<div className="flex items-center space-x-2">
              <SlMagnifier />
              <span>搜索</span>
            </div>} href="/search" />
          </Tabs>
        </NavbarContent>
        <NavbarContent data-tauri-drag-region justify="end">
          <NavbarItem>
            <Button onClick={() => { location.reload() }} variant="light" size="sm" isIconOnly startContent={<SlRefresh />}>
            </Button>
          </NavbarItem>
          <NavbarItem>
            <SettingButton />
          </NavbarItem>
        </NavbarContent>
      </NavWarpper>)

    }
  }
  return (
    <OptionNav />
  );
};
