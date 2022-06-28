#!/bin/bash

cd _clones/pinakes-ui/

# Rename the zh_cn folder 
mv translations/zh_cn translations/zh

pinakes_ui_path="locales" # locale will be dropped here

rsync -av translations/ $pinakes_ui_path

rm -rf translations/
