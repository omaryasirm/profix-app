"use client";

import { Combobox, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { LuChevronsUpDown } from "react-icons/lu";
import { IoIosSearch } from "react-icons/io";
import { isMobile } from "react-device-detect";
import { AiOutlineConsoleSql } from "react-icons/ai";

interface Props {
  handleChange: Function;
  addNew?: Function;
  searchItems: any[];
  searchItemValue: string;
  style?: React.CSSProperties;
  placeholder: string;
  id?: string;
}

const MyCombobox = ({
  handleChange,
  addNew,
  searchItems,
  searchItemValue,
  style,
  placeholder,
  id,
}: Props) => {
  const [query, setQuery] = useState("");

  const scrollToTop = () => {
    if (!id) return;
    console.log("scroll", scroll);
    console.log("isMobile", isMobile);
    const element = document.getElementById(id);
    element?.scrollIntoView(true);
  };

  const filteredList =
    query === ""
      ? searchItems
      : searchItems.filter((item) =>
          item[searchItemValue]!.toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <div style={style}>
      <Combobox onChange={(e) => handleChange(e)}>
        <div className="max-w-xl mt-1">
          <div className="relative max-w-xl w-full cursor-default bg-white text-left sm:text-sm">
            <Combobox.Input
              onClick={scrollToTop}
              placeholder={placeholder}
              className="w-full border-none py-2 pl-8 pr-10 text-sm my-border leading-5 text-gray-900"
              // displayValue={(item) => item.name}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button
              onClick={scrollToTop}
              className="absolute inset-y-0 left-1.5 flex items-center pr-2"
            >
              <IoIosSearch
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>

            <Combobox.Button
              onClick={scrollToTop}
              className="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <LuChevronsUpDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options
              className="z-10 absolute max-w-xl mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              style={{ width: "calc(100% - 40px)" }}
            >
              {addNew && (
                <Combobox.Button
                  onClick={(value) => addNew(query)}
                  className="relative cursor-default ml-3 my-button"
                >
                  Add
                  {/* <Button
                  onClick={(value) => addNew(query)}
                  className="font-medium"
                >
                  Add
                </Button> */}
                </Combobox.Button>
              )}
              {filteredList.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredList.map((item: any, index: any) => (
                  <Combobox.Option
                    key={index}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-5 pr-4 ${
                        active ? "bg-teal-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {item[searchItemValue]}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            {/* <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              /> */}
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default MyCombobox;
